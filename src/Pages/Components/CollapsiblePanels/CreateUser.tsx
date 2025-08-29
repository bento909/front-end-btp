import { useState, useEffect } from "react";
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { Config, Profile, User } from "../../../Constants/constants.tsx";
import Resources from "../../../Styles/Resources.tsx";
import { useSelector, useDispatch } from "react-redux";  // Import useDispatch
import {AppDispatch, RootState} from "../../../redux/store.tsx";
import { fetchUsersThunk } from "../../../redux/usersSlice.tsx";  // Import the fetchUsersThunk

const client = new CognitoIdentityProviderClient({
    region: Config.REGION,
    credentials: fromCognitoIdentityPool({
        clientConfig: { region: Config.REGION },
        identityPoolId: Config.IDENTITY_POOL_ID,
    }),
});

export const signUpUser = async (email: string, name: string, newUserProfile: Profile, creatorEmail: string) => {
    const command = new AdminCreateUserCommand({
        UserPoolId: Config.USER_POOL_ID,
        Username: email,
        TemporaryPassword: "Pa55w0rd!",
        MessageAction: "SUPPRESS",
        UserAttributes: [
            { Name: "email", Value: email },
            { Name: "name", Value: name },
            { Name: "profile", Value: newUserProfile },
            { Name: "creatorEmail", Value: creatorEmail}
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

// User Form Component
interface CreateUserFormProps {
    user: User;
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserForm: React.FC<CreateUserFormProps> = ({ user }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [profile, setProfile] = useState<Profile | "">("");
    const [message, setMessage] = useState("");
    const dispatch = useDispatch<AppDispatch>();

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
            dispatch(fetchUsersThunk());
            setMessage("Signup successful! User should 1. Sign in with Pa55w0rd! 2. Give a new password, 3. See their email for a security code, and enter it when prompted.");
        } catch {
            setMessage("Error signing up. Please try again.");
        }
    };

    return (
        <>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
                {user.permissions.createUsers.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <button onClick={handleSignUp}>Sign Up</button>
            {message && <p>{message}</p>}
        </>
    );
};

const Signup: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const toggleForm = () => setIsFormVisible(!isFormVisible);

    return user && user.permissions.createUsers.length > 0 && (
        <Resources title="Create a user" isOpen={isFormVisible} toggle={toggleForm}>
            <UserForm user={user} toggleForm={toggleForm} isFormVisible={isFormVisible} />
        </Resources>
    );
};

export default Signup;
