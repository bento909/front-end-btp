import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GroupExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, PutItemCommand, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { CloudFormationClient, DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { randomBytes } from 'node:crypto';
import type { Schema } from '../../data/resource';

const cognito = new CognitoIdentityProviderClient();
const ddb = new DynamoDBClient();
const cfn = new CloudFormationClient();

// BTP-16: brand-new orgs are bootstrapped in one shot by this mutation —
// Cognito Group (org) + Cognito Group (org staff) + the Organization
// DynamoDB row + the org's first admin user, mirroring exactly what was
// done by hand via AWS CLI for every org that existed before this (org-a-test,
// org-b-test, bento909). Restricted to `platform-admin` at the SCHEMA level
// (allow.group('platform-admin') in amplify/data/resource.ts) — same pattern
// as ContactMessage's admin moderation, no re-check needed here.

// Picking 20 chars uniformly at random from a mixed charset does NOT
// guarantee every category Cognito's policy requires (upper/lower/digit/
// symbol) actually appears — with this charset that was roughly a 1-in-6
// chance of failing "Password did not conform with password policy"
// (reproduced live while provisioning the QA fixture, 2026-09-04). Fixed by
// guaranteeing one char from each required category up front, then filling
// the rest randomly and shuffling so the guaranteed chars aren't always in
// the first four positions.
function generateTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;

  const randomChar = (set: string) => set[randomBytes(1)[0] % set.length];

  const required = [randomChar(upper), randomChar(lower), randomChar(digits), randomChar(symbols)];
  const rest = Array.from(randomBytes(16), (b) => all[b % all.length]);
  const combined = [...required, ...rest];

  const shuffleBytes = randomBytes(combined.length);
  for (let i = combined.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
}

// The exact table name (Amplify appends a random per-deploy suffix:
// `Organization-<apiId>-NONE`) can't be passed in as an env var without
// creating a circular CloudFormation dependency between the data and
// function stacks (see backend.ts). Looked up once per cold start instead —
// and it MUST be scoped to this specific deployment's own stack, not an
// account-wide table scan (dynamodb:ListTables + a name-prefix match was
// tried first and is WRONG: this AWS account runs both a sandbox and a
// production deployment, both with an "Organization-*"-named table, and
// ListTables can't tell them apart — confirmed the hard way, it wrote a
// sandbox test org into the production table). Walking THIS deployment's
// own CloudFormation stack tree instead is what actually guarantees the
// right table: root stack -> "data" nested stack -> Organization's own
// per-model nested stack (every a.model() gets one) -> the
// Custom::AmplifyDynamoDBTable resource inside it.
let cachedTableName: string | undefined;
async function findNestedStack(
  parentStackNameOrArn: string,
  logicalIdPrefix: string
): Promise<string> {
  const resources = await cfn.send(new DescribeStackResourcesCommand({ StackName: parentStackNameOrArn }));
  const match = (resources.StackResources ?? []).find(
    (r) => r.ResourceType === 'AWS::CloudFormation::Stack' && r.LogicalResourceId?.startsWith(logicalIdPrefix)
  );
  if (!match?.PhysicalResourceId) {
    throw new Error(`Could not find a nested stack starting with "${logicalIdPrefix}" under "${parentStackNameOrArn}"`);
  }
  // PhysicalResourceId for a nested AWS::CloudFormation::Stack resource is
  // the nested stack's own full ARN — DescribeStackResources accepts an ARN
  // as StackName just as well as a plain name.
  return match.PhysicalResourceId;
}

async function getOrganizationTableName(): Promise<string> {
  if (cachedTableName) return cachedTableName;

  const rootStackName = process.env.ROOT_STACK_NAME;
  if (!rootStackName) {
    throw new Error('ROOT_STACK_NAME environment variable is not set');
  }

  const dataStackArn = await findNestedStack(rootStackName, 'data');
  const organizationStackArn = await findNestedStack(dataStackArn, 'amplifyDataOrganizationNestedStack');

  const orgResources = await cfn.send(new DescribeStackResourcesCommand({ StackName: organizationStackArn }));
  const tableResource = (orgResources.StackResources ?? []).find(
    (r) => r.ResourceType === 'Custom::AmplifyDynamoDBTable'
  );
  if (!tableResource?.PhysicalResourceId) {
    throw new Error('Could not find the Organization table in its nested stack');
  }

  cachedTableName = tableResource.PhysicalResourceId;
  return cachedTableName;
}

export const handler: Schema['provisionOrganization']['functionHandler'] = async (event) => {
  const identity = event.identity as { sub?: string } | undefined;
  const callerSub = identity?.sub;
  if (!callerSub) {
    throw new Error('Caller identity is missing a sub claim');
  }

  const { orgId, orgName, adminEmail, adminName } = event.arguments;

  // orgId becomes a Cognito Group name AND a DynamoDB partition key AND
  // every future record's organizationId value — keep it to a safe,
  // predictable slug shape.
  if (!/^[a-z0-9-]{3,48}$/.test(orgId)) {
    throw new Error('orgId must be 3-48 characters: lowercase letters, numbers, and hyphens only');
  }

  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('USER_POOL_ID environment variable is not set');
  }
  const tableName = await getOrganizationTableName();

  const staffGroup = `${orgId}-staff`;

  // Create both groups first. If the org group already exists, this is a
  // genuine collision (not the idempotent "staff group already exists"
  // case createOrgUser handles) — fail loudly rather than silently reusing
  // someone else's org id.
  try {
    await cognito.send(new CreateGroupCommand({ UserPoolId: userPoolId, GroupName: orgId }));
  } catch (err) {
    if (err instanceof GroupExistsException) {
      throw new Error(`Organization id "${orgId}" is already in use`);
    }
    throw err;
  }
  try {
    await cognito.send(new CreateGroupCommand({ UserPoolId: userPoolId, GroupName: staffGroup }));
  } catch (err) {
    if (!(err instanceof GroupExistsException)) {
      throw err;
    }
  }

  const now = new Date().toISOString();
  try {
    await ddb.send(
      new PutItemCommand({
        TableName: tableName,
        Item: {
          id: { S: orgId },
          name: { S: orgName },
          createdAt: { S: now },
          updatedAt: { S: now },
          __typename: { S: 'Organization' },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new Error(`Organization id "${orgId}" already has a record — partial bootstrap from a prior attempt?`);
    }
    throw err;
  }

  await cognito.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: adminEmail,
      TemporaryPassword: generateTemporaryPassword(),
      DesiredDeliveryMediums: ['EMAIL'],
      UserAttributes: [
        { Name: 'email', Value: adminEmail },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: adminName },
        { Name: 'custom:organizationId', Value: orgId },
        { Name: 'custom:role', Value: 'admin' },
        { Name: 'custom:createdBy', Value: callerSub },
      ],
    })
  );
  await cognito.send(
    new AdminAddUserToGroupCommand({ UserPoolId: userPoolId, Username: adminEmail, GroupName: orgId })
  );
  await cognito.send(
    new AdminAddUserToGroupCommand({ UserPoolId: userPoolId, Username: adminEmail, GroupName: staffGroup })
  );

  return {
    success: true,
    message: `Organization "${orgName}" (${orgId}) created with admin ${adminEmail}. They'll receive their temporary password by email.`,
  };
};
