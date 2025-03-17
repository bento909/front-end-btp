import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useUserAttributes } from "./PermissionsProvider/UserAttributesContext.tsx"
import { User } from "./Constants/constants.ts";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const thisUser: User = useUserAttributes();
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
            <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#f5f5f5" }}>
                <h1>Hello, {thisUser.name}</h1>
                <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                    Logout
                </button>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Layout;