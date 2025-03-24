import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useUserAttributes } from "./PermissionsProvider/UserAttributesContext.tsx"
import { Button } from "./Styles/CollapsiblePanel.tsx"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { user } = useUserAttributes(); // Extract 'user' instead of using the whole object
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div>
            <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", background: "#f5f5f5", gap: "3rem"}}>
                <h1>Hello, {user ? user.name : "unexpected guest"}</h1>
                <Button onClick={handleLogout} isOpen={true}>
                    Logout
                </Button>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Layout;