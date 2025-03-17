import { useState, useEffect } from "react";
import { useUserAttributes } from "../PermissionsProvider/UserAttributesContext.tsx";
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { Config, Profile, User } from "../Constants/constants.ts";

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

// User Form Component
interface UserFormProps {
    user: User;
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, toggleForm, isFormVisible }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [profile, setProfile] = useState<Profile | "">("");
    const [message, setMessage] = useState("");

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
        <div style={{
            backgroundColor: "#ffffff",
            color: "#000000",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            position: "relative"
        }}>
            {/* Header with Button */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
            }}>
                <h2 style={{ margin: 0 }}>Add a user</h2>
                <button
                    onClick={toggleForm}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: isFormVisible ? "#000" : "#fff",
                        color: isFormVisible ? "#fff" : "#000",
                        border: "1px solid #000",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderRadius: "5px"
                    }}
                >
                    {isFormVisible ? "Close Form" : "Add a User"}
                </button>
            </div>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "8px", fontSize: "16px" }}
            />

            <input
                type="text"
                placeholder="Name (e.g. Ben, Ben Thomas, or El Benjyrino, if you're not into the whole brevity thing)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: "8px", fontSize: "16px" }}
            />

            <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as Profile)}
                style={{ padding: "8px", fontSize: "16px" }}
            >
                {user.permissions.createUsers.map((type: Profile) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            <button onClick={handleSignUp} style={{
                padding: "10px",
                backgroundColor: "#007bff",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                marginTop: "10px"
            }}>
                Sign Up
            </button>

            {message && <p>{message}</p>}
        </div>
    );
};

// Signup Component with Toggle Feature
const Signup: React.FC = () => {
    const user = useUserAttributes();
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleForm = () => setIsFormVisible(!isFormVisible);

    return user.permissions.createUsers.length > 0 && (
        <div style={{ padding: "20px" }}>
            {isFormVisible && <UserForm user={user} toggleForm={toggleForm} isFormVisible={isFormVisible} />}
            {!isFormVisible && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0 }}>Line 164</h2>
                    <button
                        onClick={toggleForm}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: "#fff",
                            color: "#000",
                            border: "1px solid #000",
                            cursor: "pointer",
                            fontSize: "14px",
                            borderRadius: "5px"
                        }}
                    >
                        Line 177
                    </button>
                </div>
            )}
        </div>
    );
};

export default Signup;
