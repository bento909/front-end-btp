export interface User {
    name: string;
    emailAddress: string;
    profile: Profile;
    organizationId: string;
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

export function canReadMessages(user: User): boolean {
    return user.profile === Profile.ADMIN;
}

export function canCreatePlan(user: User): boolean {
    return (
        user.permissions.createPlan === CreatePlan.MY_OWN ||
        user.permissions.createPlan === CreatePlan.MY_USERS
    );
}
