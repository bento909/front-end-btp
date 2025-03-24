import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostLoginScreen from './MainScreen/PostLoginScreen.tsx';
import MainMenu from './UserMenus/Admin/MainMenu.tsx';
import TesterMenu from './UserMenus/Tester/TesterMenu.tsx';

import Layout from "./Layout.tsx";

function AppRoutes() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<PostLoginScreen />} />
                    <Route path="/adminMenu" element={<MainMenu />} />
                    <Route path="/testerMenu" element={<TesterMenu />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default AppRoutes;
