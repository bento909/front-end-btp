import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import {Config, UserTypes} from '../constants.ts'

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