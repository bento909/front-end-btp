import { defineBackend } from '@aws-amplify/backend';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createOrgUser } from './functions/createOrgUser/resource';
import { listOrgUsers } from './functions/listOrgUsers/resource';

const backend = defineBackend({
  auth,
  data,
  createOrgUser,
  listOrgUsers,
});

const userPool = backend.auth.resources.userPool;

// Narrowly scoped to exactly the Cognito admin actions each function needs,
// on this one user pool only — not a broad Cognito or account-wide grant.
const cognitoAdminPolicy = new iam.PolicyStatement({
  sid: 'AllowCognitoOrgUserManagement',
  actions: [
    'cognito-idp:AdminCreateUser',
    'cognito-idp:AdminAddUserToGroup',
    'cognito-idp:ListUsersInGroup',
    'cognito-idp:AdminGetUser',
  ],
  resources: [userPool.userPoolArn],
});

backend.createOrgUser.resources.lambda.addToRolePolicy(cognitoAdminPolicy);
backend.listOrgUsers.resources.lambda.addToRolePolicy(cognitoAdminPolicy);

// resources.lambda is typed as the narrower IFunction interface, but a
// function defined via defineFunction() is always backed by a real
// lambda.Function instance (never an external/cross-stack reference), so
// this cast is safe — needed because addEnvironment() isn't on IFunction.
(backend.createOrgUser.resources.lambda as LambdaFunction).addEnvironment('USER_POOL_ID', userPool.userPoolId);
(backend.listOrgUsers.resources.lambda as LambdaFunction).addEnvironment('USER_POOL_ID', userPool.userPoolId);
