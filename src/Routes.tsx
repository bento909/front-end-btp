import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PostLoginScreen from './Pages/Page/PostLoginScreen.tsx';
import UserMenu from './Pages/Page/User/UserMenu.tsx';
import TesterMenu from './Pages/Page/Tester/TesterMenu.tsx';
import Layout from "./Pages/Components/Layout.tsx";
import LandingPage from "./Pages/Page/LandingPage.tsx"
import {Authenticator} from "@aws-amplify/ui-react";

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
                                    <Route path="trainingMenu" element={<UserMenu />} />
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

export default AppRoutes;
