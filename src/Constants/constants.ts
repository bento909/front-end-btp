export enum Config {
    REGION = "eu-north=1",
    COGNITO_CLIENT = "2smsm5p4lopf156dbja707il5n"
}

export interface User {
    name: string;
    emailAddress: string;
    profile: Profile;
    creator: string;
    permissions: Permissions
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