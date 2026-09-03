import {
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
  // and no email, only token metadata plus Cognito group membership. Group
  // membership is exactly what we need: identity.groups is the caller's own
  // org id directly (group name === organizationId by design), no lookup
  // required.
  const identity = event.identity as { groups?: string[] } | undefined;
  // Staff members belong to TWO groups (their org + "<org>-staff", see
  // BTP-11 in amplify/data/resource.ts) — find the one that isn't the staff
  // group rather than relying on cognito:groups token ordering.
  const callerOrgId = identity?.groups?.find((g) => !g.endsWith('-staff'));

  if (!callerOrgId) {
    throw new Error('Caller is not a member of any organization');
  }

  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('USER_POOL_ID environment variable is not set');
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

  return (response.Users ?? []).map((u) => ({
    id: attr(u.Attributes, 'sub'),
    email: attr(u.Attributes, 'email'),
    name: attr(u.Attributes, 'name'),
    role: attr(u.Attributes, 'custom:role'),
    organizationId: attr(u.Attributes, 'custom:organizationId'),
    enabled: u.Enabled ?? false,
    status: u.UserStatus ?? 'UNKNOWN',
    createdAt: u.UserCreateDate?.toISOString() ?? '',
  }));
};
