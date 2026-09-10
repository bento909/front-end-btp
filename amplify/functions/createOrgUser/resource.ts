import { defineFunction } from '@aws-amplify/backend';

export const createOrgUser = defineFunction({
  name: 'createOrgUser',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
