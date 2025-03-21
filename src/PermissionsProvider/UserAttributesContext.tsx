import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Profile, User } from '../Constants/constants.ts';
import { PermissionService } from "./PermissionsMap.tsx";

interface UserAttributesContextType {
    user: User | null;
    changeUserAttributes: (updatedAttributes: Partial<User>) => void;
}

const UserAttributesContext = createContext<UserAttributesContextType | null>(null);

export const UserAttributesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [thisUser, setThisUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const attributes = await fetchUserAttributes();
                const userTypeString = attributes.profile ? attributes.profile : 'basic_user';
                const userType: Profile = userTypeString as Profile;
                setThisUser({
                    name: attributes.name ? attributes.name : 'wonderful human',
                    emailAddress: attributes.email ? attributes.email : '',
                    profile: userType,
                    creator: attributes.zoneinfo ? attributes.zoneinfo : '',
                    permissions: PermissionService.getPermissions(userType),
                });
            } catch (error) {
                console.error("Error fetching user attributes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttributes();
    }, []);

    // Function to update user attributes
    const changeUserAttributes = (updatedAttributes: Partial<User>) => {
        setThisUser((prevUser) => {
            if (!prevUser) return null;
            console.log("User has been changed from:", prevUser); // Log old user before updating
            const newUser = { ...prevUser, ...updatedAttributes };
            console.log("User has been changed to:", newUser); // Log new user after updating
            return newUser;
        });
    };

    if (loading) {
        return <div>Loading user data...</div>;
    }

    return (
        <UserAttributesContext.Provider value={{ user: thisUser, changeUserAttributes }}>
            {children}
        </UserAttributesContext.Provider>
    );
};

// Custom Hook to use User Attributes in child components
export const useUserAttributes = () => {
    const context = useContext(UserAttributesContext);
    if (!context) {
        throw new Error("useUserAttributes must be used within a UserAttributesProvider");
    }
    return context;
};
