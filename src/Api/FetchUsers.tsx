import { Config } from "../Constants/constants.tsx";

// Cognito Config
const clientId = Config.COGNITO_CLIENT;
const getUsersUrl = Config.GET_USERS_URL;

// Retrieve Cognito Token
async function getCognitoToken(): Promise<string | null> {
    try {
        const lastUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
        if (!lastUser) throw new Error("User not found in local storage");
        console.log('last user: ' + lastUser);

        const tokenString = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.${lastUser}.idToken`);
        if (!tokenString) throw new Error("No token found for user");

        console.log('token String: ' + lastUser);

        return tokenString;
    } catch (error) {
        console.error("Error getting Cognito token:", error);
        return null;
    }
}

export const fetchUsers = async () => {
    try {
        console.log("about to call await getCognitoToken")
        const token = await getCognitoToken();
        if (!token) throw new Error("No Cognito token found");
        console.log('About to send GET')
        const response = await fetch(getUsersUrl, {
            method: "GET",
            headers: {
                "Authorization": token, // Send Cognito JWT Token
                "Content-Type": "application/json"
            }
        });
        console.log('GET sent, response received;')
        console.log(response)
        console.log('Response is good, no?')
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Users:", data);
        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
};

fetchUsers();
