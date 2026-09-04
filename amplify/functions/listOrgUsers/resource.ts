import { defineFunction } from '@aws-amplify/backend';

export const listOrgUsers = defineFunction({
  name: 'listOrgUsers',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
