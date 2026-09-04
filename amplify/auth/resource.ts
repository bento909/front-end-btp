import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * custom:organizationId — the Cognito Group name a user belongs to (immutable;
 * set once at user creation by the createOrgUser function). Doubles as the
 * multi-tenant boundary: every org-scoped model's authorization rule checks
 * group membership against this value.
 * custom:role — replaces the old, misused standard "profile" attribute
 * (which OIDC defines as a profile-page URL, not a role). Holds the app's
 * Profile enum value (admin/trainer/basic_user).
 * custom:createdBy — the `sub` of whichever user called createOrgUser to
 * create this account (immutable). Backs BTP-12: a trainer's "my users"
 * view is scoped to accounts they personally created, not the whole org.
 *
 * platform-admin — a single static Cognito Group, separate from the
 * per-org groups (which are dynamic, one per Organization). Not a tenant
 * boundary — this is cross-org, for the app owner to moderate the shared
 * public ContactMessage inbox. Membership is manual (AdminAddUserToGroup),
 * not something createOrgUser ever grants.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['platform-admin'],
  userAttributes: {
    'custom:organizationId': {
      dataType: 'String',
      mutable: false,
      minLen: 1,
      maxLen: 64,
    },
    'custom:role': {
      dataType: 'String',
      mutable: true,
      minLen: 1,
      maxLen: 32,
    },
    'custom:createdBy': {
      dataType: 'String',
      mutable: false,
      minLen: 1,
      maxLen: 64,
    },
  },
});
