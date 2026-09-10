import { defineBackend } from '@aws-amplify/backend';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Arn, Stack } from 'aws-cdk-lib';
import type { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createOrgUser } from './functions/createOrgUser/resource';
import { listOrgUsers } from './functions/listOrgUsers/resource';
import { createOrganization } from './functions/createOrganization/resource';

const backend = defineBackend({
  auth,
  data,
  createOrgUser,
  listOrgUsers,
  createOrganization,
});

const userPool = backend.auth.resources.userPool;

// Narrowly scoped to exactly the Cognito admin actions each function needs,
// on this one user pool only — not a broad Cognito or account-wide grant.
const cognitoAdminPolicy = new iam.PolicyStatement({
  sid: 'AllowCognitoOrgUserManagement',
  actions: [
    'cognito-idp:AdminCreateUser',
    'cognito-idp:AdminAddUserToGroup',
    'cognito-idp:ListUsersInGroup',
    'cognito-idp:AdminGetUser',
    // BTP-11: createOrgUser creates the per-org "-staff" group on first use
    // (idempotently — CreateGroup on an existing group just errors, caught
    // and ignored in the handler rather than checked for first via GetGroup).
    'cognito-idp:CreateGroup',
  ],
  resources: [userPool.userPoolArn],
});

backend.createOrgUser.resources.lambda.addToRolePolicy(cognitoAdminPolicy);
backend.listOrgUsers.resources.lambda.addToRolePolicy(cognitoAdminPolicy);
backend.createOrganization.resources.lambda.addToRolePolicy(cognitoAdminPolicy);

// BTP-16: createOrganization writes the new org's row directly to the
// Organization table. Three approaches were tried before landing here:
// (1) referencing backend.data.resources.tables['Organization'] directly —
// creates a circular CloudFormation dependency (data stack needs the
// Lambda for its resolver, the Lambda would need data's table); (2) a
// runtime dynamodb:ListTables name-prefix lookup — deploys fine but is
// WRONG, ListTables is account/region-wide, and in an account running both
// a sandbox and production deployment (exactly this project's setup) it
// can match the OTHER environment's table, which it did, silently writing
// a sandbox test straight into production, caught by direct verification
// after a test run, not by the deploy succeeding; (3) `allow.resource()`
// on the model, the documented Amplify pattern for exactly this — not
// available for model-level authorization in this installed package
// version (confirmed in @aws-amplify/data-schema's own source: model
// authorization callbacks explicitly strip `resource` out of the `allow`
// builder before invoking them).
//
// What's actually deployed: the handler walks THIS deployment's own
// CloudFormation stack tree at runtime (root stack -> "data" nested stack
// -> Organization's own per-model nested stack -> the
// Custom::AmplifyDynamoDBTable resource) via cloudformation:DescribeStackResources,
// which is scoped to exactly this deployment's real resource graph — not a
// name pattern that could coincidentally match another deployment.
// DescribeStackResources itself is granted broadly (resources: ['*']) since
// nested-stack physical names get unpredictably truncated/hashed at deeper
// nesting levels (confirmed directly — a same-deployment prefix-based ARN
// pattern failed to match a stack it should have), and the action is
// read-only resource *topology*, not data — low risk even unscoped. The
// dynamodb:PutItem grant stays a wildcard (Organization-*) for the same
// synth-time-unknowable-exact-name reason; the stack-walk being
// deployment-accurate is what actually prevents cross-environment writes,
// not IAM scoping alone.
backend.createOrganization.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    sid: 'AllowDescribeStacksForOrganizationTableLookup',
    actions: ['cloudformation:DescribeStackResources'],
    resources: ['*'],
  })
);
const authStack = Stack.of(userPool);
const organizationTableArnPattern = Arn.format(
  {
    service: 'dynamodb',
    resource: 'table',
    resourceName: 'Organization-*',
    account: authStack.account,
    region: authStack.region,
  },
  authStack
);
backend.createOrganization.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    sid: 'AllowOrganizationTableWrite',
    actions: ['dynamodb:PutItem'],
    resources: [organizationTableArnPattern],
  })
);

// resources.lambda is typed as the narrower IFunction interface, but a
// function defined via defineFunction() is always backed by a real
// lambda.Function instance (never an external/cross-stack reference), so
// this cast is safe — needed because addEnvironment() isn't on IFunction.
(backend.createOrgUser.resources.lambda as LambdaFunction).addEnvironment('USER_POOL_ID', userPool.userPoolId);
(backend.listOrgUsers.resources.lambda as LambdaFunction).addEnvironment('USER_POOL_ID', userPool.userPoolId);
(backend.createOrganization.resources.lambda as LambdaFunction).addEnvironment('USER_POOL_ID', userPool.userPoolId);
// The root stack's own name is a plain string, known at synth time without
// referencing any stack's resources — safe, non-circular. Used by the
// handler as the starting point for the CloudFormation stack-tree walk.
(backend.createOrganization.resources.lambda as LambdaFunction).addEnvironment(
  'ROOT_STACK_NAME',
  (authStack.nestedStackParent ?? authStack).stackName
);
