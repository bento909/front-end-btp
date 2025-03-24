import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostLoginScreen from './Pages/Page/PostLoginScreen.tsx';
import UserMenu from './Pages/Page/User/UserMenu.tsx';
import TesterMenu from './Pages/Page/Tester/TesterMenu.tsx';
import Layout from "./Pages/Components/Layout.tsx";

function AppRoutes() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<PostLoginScreen />} />
                    <Route path="/adminMenu" element={<UserMenu />} />
                    <Route path="/testerMenu" element={<TesterMenu />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default AppRoutes;
