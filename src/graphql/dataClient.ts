import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Typed Amplify Gen2 data client — used for the new org-scoped custom
// mutation/query (createOrgUser, listOrgUsers). The older untyped client in
// graphqlClient.ts (hand-written GraphQL documents, BTP-7) is left as-is for
// now; migrating the rest of the app to this client is BTP-7's job, not this
// change's.
//
// authMode explicitly set to 'userPool' for clarity — matches the schema's
// own default, but createOrgUser/listOrgUsers both require
// allow.authenticated() (Cognito login) so this must never silently follow
// a future default-mode change.
export const dataClient = generateClient<Schema>({ authMode: 'userPool' });
