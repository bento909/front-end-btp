import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Schema } from '../../data/resource';

const client = new CognitoIdentityProviderClient();

function attr(
  attributes: { Name?: string; Value?: string }[] | undefined,
  name: string
): string {
  return attributes?.find((a) => a.Name === name)?.Value ?? '';
}

export const handler: Schema['listOrgUsers']['functionHandler'] = async (event) => {
  // AppSync passes the caller's ACCESS token claims here (confirmed via a
  // live debug dump, 2026-09-03) — access tokens carry no custom attributes
  // and no email, only token metadata plus Cognito group membership and
  // `sub`. Group membership gives us the org directly; role/createdBy still
  // need one AdminGetUser lookup, same pattern as createOrgUser.
  const identity = event.identity as { groups?: string[]; sub?: string } | undefined;
  // Staff members belong to TWO groups (their org + "<org>-staff", see
  // BTP-11 in amplify/data/resource.ts) — find the one that isn't the staff
  // group rather than relying on cognito:groups token ordering.
  const callerOrgId = identity?.groups?.find((g) => !g.endsWith('-staff'));
  const callerSub = identity?.sub;

  if (!callerOrgId || !callerSub) {
    throw new Error('Caller is not a member of any organization');
  }

  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('USER_POOL_ID environment variable is not set');
  }

  const caller = await client.send(
    new AdminGetUserCommand({ UserPoolId: userPoolId, Username: callerSub })
  );
  const callerRole = attr(caller.UserAttributes, 'custom:role');

  // BTP-12: matches PermissionService.tsx's ViewUsers enum — admin sees the
  // whole org, trainer sees only accounts they personally created, anyone
  // else (basic_user, or a caller missing a role) sees nobody. Enforced
  // here server-side, not just left to the UI to not render a panel.
  if (callerRole !== 'admin' && callerRole !== 'trainer') {
    return [];
  }

  // Lists members of the CALLER's own org's Cognito Group — never
  // client-suppliable, so this can only ever return the caller's own
  // organization's users. (Cognito's ListUsers Filter param explicitly does
  // NOT support custom attributes, so group membership — the same thing
  // that gates data access via groupsDefinedIn — is the correct mechanism
  // here too, not a custom-attribute filter.)
  const response = await client.send(
    new ListUsersInGroupCommand({
      UserPoolId: userPoolId,
      GroupName: callerOrgId,
    })
  );

  const users = (response.Users ?? []).map((u) => ({
    id: attr(u.Attributes, 'sub'),
    email: attr(u.Attributes, 'email'),
    name: attr(u.Attributes, 'name'),
    role: attr(u.Attributes, 'custom:role'),
    organizationId: attr(u.Attributes, 'custom:organizationId'),
    createdBy: attr(u.Attributes, 'custom:createdBy'),
    enabled: u.Enabled ?? false,
    status: u.UserStatus ?? 'UNKNOWN',
    createdAt: u.UserCreateDate?.toISOString() ?? '',
  }));

  // Cognito's own ListUsers-family APIs can't filter on custom attributes
  // (see comment above), so this ownership filter has to happen here in
  // code rather than as a request parameter.
  const scoped = callerRole === 'trainer'
    ? users.filter((u) => u.createdBy === callerSub)
    : users;

  return scoped.map(({ createdBy: _createdBy, ...u }) => u);
};
