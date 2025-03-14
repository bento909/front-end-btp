import { fetchUserAttributes  } from 'aws-amplify/auth';
import {CreatePlan, Permissions, UserTypes, ViewUsers, User} from '../Constants/constants.ts';

class UserCache {
    private static instance: UserCache;
    private user: User | null = null;

    // Private constructor to enforce Singleton pattern
    private constructor() {}

    // Get the Singleton instance
    public static getInstance(): UserCache {
        if (!UserCache.instance) {
            UserCache.instance = new UserCache();
        }
        return UserCache.instance;
    }

    // Fetch user attributes (cached)
    public async getUser(): Promise<User> {
        if (this.user) {
            console.log("Returning cached user:", this.user);
            return this.user;
        }

        try {
            console.log("Fetching user from Cognito...");
            const attributes = await fetchUserAttributes();
            const userTypeString = attributes.profile ? attributes.profile : 'basic_user'
            const userType: UserTypes = (userTypeString as UserTypes)
            this.user = {
                name: attributes.name || "You",
                emailAddress: attributes.email || "",
                userType: userType,
                creator: attributes.zoneinfo || "",
                permissions: this.getPermissions(userType)
            };
            return this.user;
        } catch (error) {
            console.error("Error fetching user attributes:", error);
            throw new Error("Failed to fetch user");
        }
    }

    private getPermissions(userType: UserTypes): Permissions {
        const permissionsMap: Record<UserTypes, Permissions> = {
            [UserTypes.ADMIN]: {
                createUsers: [UserTypes.ADMIN, UserTypes.TESTER, UserTypes.TRAINER, UserTypes.TRAINER_USER, UserTypes.BASIC_USER],
                viewUsers: ViewUsers.ALL,
                createPlan: CreatePlan.MY_OWN,
                createExercise: false,
                viewMyPlan: false
            },
            [UserTypes.TESTER]: {
                createUsers: [],
                viewUsers: ViewUsers.NONE,
                createPlan: CreatePlan.NONE,
                createExercise: false,
                viewMyPlan: false
            },
            [UserTypes.TRAINER]: {
                createUsers: [UserTypes.BASIC_USER],
                viewUsers: ViewUsers.MY_USERS,
                createPlan: CreatePlan.MY_USERS,
                createExercise: true,
                viewMyPlan: false
            },
            [UserTypes.TRAINER_USER]: {
                createUsers: [],
                viewUsers: ViewUsers.NONE,
                createPlan: CreatePlan.MY_OWN,
                createExercise: true,
                viewMyPlan: true
            },
            [UserTypes.BASIC_USER]: {
                createUsers: [],
                viewUsers: ViewUsers.NONE,
                createPlan: CreatePlan.NONE,
                createExercise: false,
                viewMyPlan: true
            },
        };

        return permissionsMap[userType] || {
            createUsers: [],
            viewUsers: ViewUsers.NONE,
            createPlan: CreatePlan.NONE,
            createExercise: false,
        };
    }

    // Clear cache - Called on Logout
    public clearCache(): void {
        console.log('Clearing Cache!')
        this.user = null;
        console.log('User has been nulled? :', this.getUser())
    }

}
// Export Singleton instance
export const userCache = UserCache.getInstance();