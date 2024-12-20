import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                <h1>Ben is awesome</h1>
                <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                    Logout
                </button>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Layout;