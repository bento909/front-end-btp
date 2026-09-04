import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

// Typed Amplify Gen2 data client — the only GraphQL client in the app
// (BTP-7 removed the old hand-written-document client and its graphqlClient.ts).
// Plan/PlanDay/PlanExercise use dataClient.models.*; PlanExercise fetches are
// lazy (fetched per-day, on expand) rather than nested eagerly into Plan, so
// a trainer with many clients/plans doesn't pull every exercise on login.
//
// authMode explicitly set to 'userPool' for clarity — matches the schema's
// own default, but createOrgUser/listOrgUsers both require
// allow.authenticated() (Cognito login) so this must never silently follow
// a future default-mode change.
export const dataClient = generateClient<Schema>({ authMode: 'userPool' });
