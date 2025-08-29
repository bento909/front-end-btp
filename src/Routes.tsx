import {BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import PostLoginScreen from './Pages/Page/PostLoginScreen.tsx';
import Layout from "./Pages/Components/Layout.tsx";
import LandingPage from "./Pages/Page/LandingPage.tsx"
import {Authenticator} from "@aws-amplify/ui-react";
import SignUp from "./Pages/Components/CollapsiblePanels/CreateUser.tsx";
import ViewAllUsers from "./Pages/Components/CollapsiblePanels/ViewUsers.tsx";
import CreateExercise from "./Pages/Components/CollapsiblePanels/CreateExercise.tsx";
import ListExercises from "./Pages/Components/CollapsiblePanels/ListExercises.tsx";
import EditPlans from "./Pages/Components/CollapsiblePanels/EditPlans.tsx"
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "./redux/store.tsx";
import {reset} from "./redux/usersSlice.tsx";
import {updateAuthUser} from "./redux/authSlice.tsx";
import {Profile} from "./Constants/constants.tsx";
import {PermissionService} from "./Helpers/PermissionService.tsx";
import ViewMessages from "./Pages/Components/CollapsiblePanels/ViewMessages.tsx";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public landing page */}
                <Route path="/" element={<LandingPage />} />

                {/* Protected routes wrapped in Authenticator */}
                <Route
                    path="/app/*"
                    element={
                        <Authenticator hideSignUp={true}>
                            <Layout>
                                <Routes>
                                    <Route path="home" element={<PostLoginScreen />} />
                                    <Route path="trainingMenu" element={<Menu />} />
                                    <Route path="testerMenu" element={<TesterMenu />} />
                                </Routes>
                            </Layout>
                        </Authenticator>
                    }
                />
            </Routes>
        </Router>
    );
}

const Menu = () => {
    return (
        <main>
            <ViewMessages/>
            <ViewAllUsers />
            <SignUp />
            <CreateExercise />
            <ListExercises />
            <EditPlans />
        </main>
    );
};


const TesterMenu = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    function handleNameChange(role: string) {
        const testName = role  + ' (test mode)';
        dispatch(reset());
        dispatch(updateAuthUser({
                profile: role as Profile,
                name: testName,
                permissions: PermissionService.getPermissions(role as Profile),
                emailAddress: 'test@test.test',
                creator: user ? user.emailAddress : 'Something odd has happened!'
            })
        );
        navigate("/");
    }

    return (
        <main>
            <h1>Hello, this is the page for you, the tester</h1>
            <h2>When you click one of the below roles you will magically take on their powers</h2>
            <ul>
                {Object.values(Profile).map((role) => (
                    <li key={role as string} onClick={() => handleNameChange(role)}>
                        {role as string}
                    </li>
                ))}
            </ul>
        </main>
    );
};


export default AppRoutes;
