import { CreatePlan, Profile, ViewUsers, Permissions } from "../Constants/constants.tsx";

export class PermissionService {
    public static getPermissions(userType: Profile): Permissions {
        const permissionsMap: Record<Profile, Permissions> = {
            [Profile.ADMIN]: {
                createUsers: [Profile.ADMIN, Profile.TRAINER, Profile.BASIC_USER],
                viewUsers: ViewUsers.ALL,
                createPlan: CreatePlan.MY_OWN,
                createExercise: false,
                viewMyPlan: false,
            },
            [Profile.TRAINER]: {
                createUsers: [Profile.BASIC_USER],
                viewUsers: ViewUsers.MY_USERS,
                createPlan: CreatePlan.MY_USERS,
                createExercise: true,
                viewMyPlan: false,
            },
            [Profile.BASIC_USER]: {
                createUsers: [],
                viewUsers: ViewUsers.NONE,
                createPlan: CreatePlan.NONE,
                createExercise: false,
                viewMyPlan: true,
            },
        };

        return permissionsMap[userType] || {
            createUsers: [],
            viewUsers: ViewUsers.NONE,
            createPlan: CreatePlan.NONE,
            createExercise: false,
            viewMyPlan: false,
        };
    }
}