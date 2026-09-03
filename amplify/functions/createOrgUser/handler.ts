import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
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
  admin: ['admin', 'tester', 'trainer', 'trainer_user', 'basic_user'],
  trainer: ['basic_user'],
  trainer_user: [],
  basic_user: [],
  tester: [],
};

function generateTemporaryPassword(): string {
  // Random per-user password instead of the old hardcoded "Pa55w0rd!"
  // shared across every account. Cognito emails it via DesiredDeliveryMediums
  // below, so nobody needs to know or communicate it manually.
  // Uses node:crypto explicitly — the bare `crypto` global (Web Crypto API)
  // isn't reliably present on every Lambda Node runtime version.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const bytes = randomBytes(20);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export const handler: Schema['createOrgUser']['functionHandler'] = async (event) => {
  // AppSync passes the caller's ACCESS token here (confirmed via a live
  // debug dump, 2026-09-03) — it carries no custom attributes, but does
  // carry Cognito group membership (= the org, directly) and `sub` (the
  // pool's actual canonical username in this config, confirmed against the
  // real token — NOT the email string used at account creation).
  const identity = event.identity as { groups?: string[]; sub?: string } | undefined;
  const callerOrgId = identity?.groups?.[0];
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

  return {
    success: true,
    message: `User ${email} created in organization ${callerOrgId} with role ${role}. They'll receive their temporary password by email.`,
  };
};
