import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GroupExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { randomBytes } from 'node:crypto';
import type { Schema } from '../../data/resource';

const client = new CognitoIdentityProviderClient();

function attr(
  attributes: { Name?: string; Value?: string }[] | undefined,
  name: string
): string {
  return attributes?.find((a) => a.Name === name)?.Value ?? '';
}

// Which roles a given caller role is permitted to create.
// Mirrors src/Helpers/PermissionService.tsx's createUsers lists — kept in
// sync manually since this runs server-side and can't import frontend code.
const ROLE_HIERARCHY: Record<string, string[]> = {
  admin: ['admin', 'trainer', 'basic_user'],
  trainer: ['basic_user'],
  basic_user: [],
};

// Roles that also get added to the org's "-staff" group (BTP-11) — the
// group that Plan/PlanDay/PlanExercise/Exercise's write authorization is
// scoped to. Keep in sync with the roles that should have write access.
const STAFF_ROLES = new Set(['admin', 'trainer']);

function staffGroupName(orgId: string): string {
  return `${orgId}-staff`;
}

// Random per-user password instead of the old hardcoded "Pa55w0rd!" shared
// across every account. Cognito emails it via DesiredDeliveryMediums below,
// so nobody needs to know or communicate it manually. Uses node:crypto
// explicitly — the bare `crypto` global (Web Crypto API) isn't reliably
// present on every Lambda Node runtime version.
//
// Picking 20 chars uniformly at random from a mixed charset does NOT
// guarantee every category Cognito's policy requires (upper/lower/digit/
// symbol) actually appears — with this charset that was roughly a 1-in-6
// chance of failing "Password did not conform with password policy" on any
// given account creation (reproduced live provisioning a QA fixture,
// 2026-09-04 — this is the exact code path every real trainer/admin hits
// creating a client). Fixed by guaranteeing one char from each required
// category up front, then filling the rest randomly and shuffling so the
// guaranteed chars aren't always in the first four positions.
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

export const handler: Schema['createOrgUser']['functionHandler'] = async (event) => {
  // AppSync passes the caller's ACCESS token here (confirmed via a live
  // debug dump, 2026-09-03) — it carries no custom attributes, but does
  // carry Cognito group membership (= the org, directly) and `sub` (the
  // pool's actual canonical username in this config, confirmed against the
  // real token — NOT the email string used at account creation).
  const identity = event.identity as { groups?: string[]; sub?: string } | undefined;
  // Staff members belong to TWO groups (their org + "<org>-staff"), and
  // cognito:groups order in the token isn't something to rely on
  // positionally — find the one that isn't the staff group, rather than
  // blindly taking groups[0].
  const callerOrgId = identity?.groups?.find((g) => !g.endsWith('-staff'));
  const callerSub = identity?.sub;

  if (!callerOrgId || !callerSub) {
    throw new Error('Caller is not a member of any organization');
  }

  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('USER_POOL_ID environment variable is not set');
  }

  // Role isn't in the access token at all (no custom attributes there), so
  // this one genuine lookup is still needed — keyed by sub, not email.
  const caller = await client.send(
    new AdminGetUserCommand({ UserPoolId: userPoolId, Username: callerSub })
  );
  const callerRole = attr(caller.UserAttributes, 'custom:role');

  if (!callerRole) {
    throw new Error('Caller is missing a role attribute');
  }

  const { email, name, role } = event.arguments;

  const allowedRoles = ROLE_HIERARCHY[callerRole] ?? [];
  if (!allowedRoles.includes(role)) {
    throw new Error(
      `Role "${callerRole}" is not permitted to create a user with role "${role}"`
    );
  }

  await client.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      TemporaryPassword: generateTemporaryPassword(),
      DesiredDeliveryMediums: ['EMAIL'],
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: name },
        // Forced to the CALLER's own org — never taken from client input,
        // so a caller can never create a user in a different organization.
        { Name: 'custom:organizationId', Value: callerOrgId },
        { Name: 'custom:role', Value: role },
        // BTP-12: backs a trainer's "my users" view.
        { Name: 'custom:createdBy', Value: callerSub },
      ],
    })
  );

  await client.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      // Group name IS the organization id — see amplify/data/resource.ts
      GroupName: callerOrgId,
    })
  );

  // BTP-11: admin/trainer accounts also join the org's "-staff" group, which
  // is what Plan/PlanDay/PlanExercise/Exercise's write authorization checks.
  if (STAFF_ROLES.has(role)) {
    const staffGroup = staffGroupName(callerOrgId);
    try {
      await client.send(
        new CreateGroupCommand({ UserPoolId: userPoolId, GroupName: staffGroup })
      );
    } catch (err) {
      if (!(err instanceof GroupExistsException)) {
        throw err;
      }
    }
    await client.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: email,
        GroupName: staffGroup,
      })
    );
  }

  return {
    success: true,
    message: `User ${email} created in organization ${callerOrgId} with role ${role}. They'll receive their temporary password by email.`,
  };
};
