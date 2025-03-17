import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostLoginScreen from './MainScreen/PostLoginScreen.tsx';
import AdminMenu from './UserMenus/Admin/AdminMenu.tsx';
import TesterMenu from './UserMenus/Tester/TesterMenu.tsx';
import TrainerMenu from './UserMenus/Trainer/TrainerMenu.tsx';
import TrainerUserMenu from './UserMenus/User/TrainerUser/TrainerUserMenu.tsx';
import BasicUserMenu from './UserMenus/User/BasicUser/BasicUserMenu.tsx';
import Layout from "./Layout.tsx";

function AppRoutes() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<PostLoginScreen />} />
                    <Route path="/adminMenu" element={<AdminMenu />} />
                    <Route path="/testerMenu" element={<TesterMenu />} />
                    <Route path="/trainerMenu" element={<TrainerMenu />} />
                    <Route path="/trainerUserMenu" element={<TrainerUserMenu />} />
                    <Route path="/basicUserMenu" element={<BasicUserMenu />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default AppRoutes;
