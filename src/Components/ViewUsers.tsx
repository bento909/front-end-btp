import { Config } from "../Constants/constants.ts";

// Cognito Config
const clientId = Config.COGNITO_CLIENT;
const getUsersUrl = Config.GET_USERS_URL;
// Initialize Cognito Identity Provider client

async function getCognitoToken(): Promise<string | null> {
    try {
        const lastUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
        if (!lastUser) throw new Error("User not found in local storage");

        const tokenString = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${lastUser}.idToken`);
        if (!tokenString) throw new Error("No token found for user");
        return tokenString;
    } catch (error) {
        console.error("Error getting Cognito token:", error);
        return null;
    }
}

// Fetch Users from API Gateway
const fetchUsers = async () => {
    try {
        const token = await getCognitoToken(); // Get Cognito token

        if (!token) throw new Error("No Cognito token found");

        const response = await fetch(getUsersUrl, {
            method: "GET",
            headers: {
                "Authorization": token,  // Send Cognito JWT Token
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("Users:", data);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

fetchUsers();
