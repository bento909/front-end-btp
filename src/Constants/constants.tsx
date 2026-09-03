export interface User {
    name: string;
    emailAddress: string;
    profile: Profile;
    organizationId: string;
    permissions: Permissions;
    id : string;
    groups: string[];
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

// Matches the server-side rule on ContactMessage (allow.group('platform-admin'))
// — the actual enforcement is that Cognito Group, not the per-org admin role.
export function canReadMessages(user: User): boolean {
    return user.groups.includes('platform-admin');
}

export function canCreatePlan(user: User): boolean {
    return (
        user.permissions.createPlan === CreatePlan.MY_OWN ||
        user.permissions.createPlan === CreatePlan.MY_USERS
    );
}
