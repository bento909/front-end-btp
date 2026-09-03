import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Typed Amplify Gen2 data client — used for the new org-scoped custom
// mutation/query (createOrgUser, listOrgUsers). The older untyped client in
// graphqlClient.ts (hand-written GraphQL documents, BTP-7) is left as-is for
// now; migrating the rest of the app to this client is BTP-7's job, not this
// change's.
//
// authMode explicitly set to 'userPool': the schema's *default* auth mode is
// apiKey (for ContactMessage's public form + backwards compat with the old
// client), but createOrgUser/listOrgUsers both require allow.authenticated()
// — Cognito login. Without this, generateClient() falls back to the schema
// default (apiKey), which doesn't satisfy allow.authenticated() and fails
// with "Not Authorized" even for a properly logged-in user.
export const dataClient = generateClient<Schema>({ authMode: 'userPool' });
