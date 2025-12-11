import React, {useEffect, useState} from "react";
import {signOut} from "aws-amplify/auth";
import {useNavigate} from "react-router-dom";
import {Button} from "../../Styles/CollapsiblePanel.tsx"
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";
import {resetAuthState} from "../../redux/authSlice.tsx";
import {reset} from "../../redux/usersSlice.tsx";

function reloadPage() {
    window.location.reload();
}

const Layout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const user = useSelector((state: RootState) => state.auth.user); // Extract 'user' instead of using the whole object
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [reloadCount, setReloadCount] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!user && reloadCount < 3) {
            const timeout = setTimeout(() => {
                setReloadCount(prev => prev + 1);
                reloadPage();
            }, 500);
            return () => clearTimeout(timeout);
        }
        if (user || reloadCount >= 3) {
            setReady(true);
        }
    }, [user, reloadCount]);

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
    if (!ready) {
        return null;
    }

    const userName = user ? user.name : "unexpected guest";

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
