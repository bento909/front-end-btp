export enum Config {
    REGION = "eu-north-1",
    COGNITO_CLIENT = "2smsm5p4lopf156dbja707il5n",
    USER_POOL_ID = "eu-north-1_EEqLiHOgL",
    IDENTITY_POOL_ID = "eu-north-1:228730fa-d6d4-4866-a22c-ff213c8fea30",
    GET_USERS_URL = "https://6dv7pag4m3.execute-api.eu-north-1.amazonaws.com/Default"
}

export interface User {
    name: string;
    emailAddress: string;
    profile: Profile;
    creator: string;
    permissions: Permissions;
    id : string;
}

export enum Profile {
    ADMIN = 'admin',
    TESTER = 'tester',
    TRAINER = 'trainer',
    TRAINER_USER = 'trainer_user',
    BASIC_USER = 'basic_user'
}

export enum ViewUsers {
    ALL = 'all',
    MY_USERS = 'my_users',
    NONE = 'none'
}

export enum CreatePlan {
    MY_OWN = 'mine',
    MY_USERS = 'my_users',
    NONE = 'none'
}

export interface Permissions {
    createUsers: Profile[],
    viewUsers: ViewUsers,
    createPlan: CreatePlan,
    createExercise: boolean,
    viewMyPlan: boolean;
}

export interface ApiUser {
    Attributes: { Name: string; Value: string }[];
    Enabled: boolean;
    UserCreateDate: string;
    UserLastModifiedDate: string;
    UserStatus: string;
    Username: string;
}

export function canCreatePlan(user: User): boolean {
    return (
        user.permissions.createPlan === CreatePlan.MY_OWN ||
        user.permissions.createPlan === CreatePlan.MY_USERS
    );
}
