import { CognitoIdentityProviderClient, AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Config, Profile, User } from '../Constants/constants.ts';
import { useState, useEffect } from "react";
import { useUserAttributes } from "../PermissionsProvider/UserAttributesContext.tsx";

const client = new CognitoIdentityProviderClient({
    region: Config.REGION, // Change to your AWS region
});

export const signUpUser = async (email: string, name: string, newUserProfile: Profile, creatorEmail: string) => {
    const command = new AdminCreateUserCommand({
        UserPoolId: Config.USER_POOL_ID,
        Username: email,
        TemporaryPassword: Math.random().toString(36).slice(-8) + "Aa1!",
        MessageAction: "SUPPRESS",
        UserAttributes: [
            { Name: "email", Value: email },
            { Name: "name", Value: name }, // Added name attribute
            { Name: "profile", Value: newUserProfile },
            { Name: "zoneinfo", Value: creatorEmail }
        ],
    });

    try {
        const response = await client.send(command);
        console.log("User created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

// Define props type correctly
interface UserFormProps {
    user: User;
}

const UserForm: React.FC<UserFormProps> = ({ user }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState(""); // New state for name
    const [profile, setProfile] = useState<Profile | "">("");
    const [message, setMessage] = useState("");

    // Set default profile to first available option
    useEffect(() => {
        if (user.permissions.createUsers.length > 0) {
            setProfile(user.permissions.createUsers[0]);
        }
    }, [user.permissions.createUsers]);

    const handleSignUp = async () => {
        if (!profile || !name) {
            setMessage("Please enter a name and select a profile.");
            return;
        }
        try {
            await signUpUser(email, name, profile, user.emailAddress);
            setMessage("Signup successful! Check your email for verification.");
        } catch (error) {
            setMessage("Error signing up. Please try again.");
        }
    };

    return (
        <div  style={{
            backgroundColor: "#ffffff",
            color: "#000000",
        }}>
            <h2>Add a user</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            {/* New name input field */}
            <input
                type="text"
                placeholder="Name (First, Full, or Nickname)"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            {/* Profile Dropdown */}
            <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as Profile)}
            >
                {user.permissions.createUsers.map((type: Profile) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>
            <button onClick={handleSignUp}>
                Sign Up
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

const Signup: React.FC = () => {
    const user = useUserAttributes();
    return user.permissions.createUsers.length > 0 && (
        <ul>
            <UserForm user={user} />
        </ul>
    );
};

export default Signup;
