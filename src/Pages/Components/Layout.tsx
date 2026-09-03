import React from "react";
import {signOut} from "aws-amplify/auth";
import {useNavigate} from "react-router-dom";
import {Button} from "../../Styles/CollapsiblePanel.tsx"
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";
import {resetAuthState} from "../../redux/authSlice.tsx";
import {reset} from "../../redux/usersSlice.tsx";

const Layout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const {user, loading, error} = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await signOut();
            dispatch(resetAuthState());
            dispatch(reset())
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    if (loading) {
        return <p style={{textAlign: "center", marginTop: "2rem"}}>Loading...</p>;
    }

    if (!user) {
        return (
            <div style={{textAlign: "center", marginTop: "2rem"}}>
                <p>{error ? `Sign-in error: ${error}` : "You need to sign in to continue."}</p>
                <Button onClick={() => navigate("/")} isOpen={true}>Return to sign-in</Button>
            </div>
        );
    }

    const userName = user.name;

    return (
        <div>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem 2rem",
                    background: "#f5f5f5",
                    gap: "3rem",
                    marginBottom: "1rem",
                }}
            >
                <h1>Hello, {userName}</h1>
                <Button onClick={handleLogout} isOpen={true}>
                    Logout
                </Button>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default Layout;
