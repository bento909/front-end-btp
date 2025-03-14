import {CognitoIdentityProviderClient, SignUpCommand} from "@aws-sdk/client-cognito-identity-provider";
import {Config, UserTypes} from '../Constants/constants.ts'
import {useState} from "react";

const client = new CognitoIdentityProviderClient({
    region: Config.REGION, // Change to your AWS region
});

export const signUpUser = async (email: string, password: string, profile: UserTypes) => {
    const command = new SignUpCommand({
        ClientId: Config.COGNITO_CLIENT, // Replace with your actual Cognito Client ID
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email },
            { Name: "profile", Value: profile }
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

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profile, setProfile] = useState("");
    const [message, setMessage] = useState("");

    const handleSignUp = async () => {
        try {
            await signUpUser(email, password, UserTypes.BASIC_USER);
            setMessage("Signup successful! Check your email for verification.");
        } catch (error) {
            setMessage("Error signing up. Please try again.");
        }
    };

    return (
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold">Sign Up</h2>
            <input
                className="border p-2 w-full mt-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="border p-2 w-full mt-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                className="border p-2 w-full mt-2"
                type="text"
                placeholder="Profile"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
            />
            <button className="bg-blue-500 text-white p-2 mt-4 w-full" onClick={handleSignUp}>
                Sign Up
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
};

export default Signup;