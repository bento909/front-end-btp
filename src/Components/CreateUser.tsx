import {CognitoIdentityProviderClient, SignUpCommand} from "@aws-sdk/client-cognito-identity-provider";
import {Config, Profile, User} from '../Constants/constants.ts'
import { useState } from "react";
import { useUserAttributes } from "../PermissionsProvider/UserAttributesContext.tsx"

const client = new CognitoIdentityProviderClient({
    region: Config.REGION, // Change to your AWS region
});

export const signUpUser = async (email: string, password: string, newUserProfile: Profile, creatorEmail: string) => {
    const command = new SignUpCommand({
        ClientId: Config.COGNITO_CLIENT,
        Username: email,
        Password: password,
        UserAttributes: [
            {Name: "email", Value: email},
            {Name: "profile", Value: newUserProfile},
            {Name: "zoneinfo", Value: creatorEmail}
            //TODO add name
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
    user: User
}

const UserForm: React.FC<UserFormProps> = ( { user } ) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profile, setProfile] = useState(Profile.BASIC_USER);
    const [message, setMessage] = useState("");

    const handleSignUp = async () => {
        try {
            await signUpUser(email, password, profile, user.emailAddress);
            setMessage("Signup successful! Check your email for verification.");
        } catch (error) {
            setMessage("Error signing up. Please try again.");
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold">Add a user</h2>
            <input
                className="border p-2 w-full mt-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            //TODO add name, remove password... let AWS create random password innit
            <input
                className="border p-2 w-full mt-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {/* Profile Dropdown */}
            <select
                className="border p-2 w-full mt-2"
                value={profile}
                onChange={(e) => setProfile(e.target.value as Profile)}
            >
                <option value="">Select User Type</option>
                {user.permissions.createUsers.map((type: Profile) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>
            <button className="bg-blue-500 text-white p-2 mt-4 w-full" onClick={handleSignUp}>
                Sign Up
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
};

const Signup: React.FC = () => {
    const user = useUserAttributes();
    return user.permissions.createUsers.size > 0 && <UserForm user={user} /> ;
};

export default Signup;