import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Styles/CollapsiblePanel.tsx"
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.tsx";
import { useDispatch } from 'react-redux';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const user = useSelector((state: RootState) => state.auth.user); // Extract 'user' instead of using the whole object
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await signOut();
            dispatch({ type: 'USER_LOGOUT' }); // Reset the Redux state
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