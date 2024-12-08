import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostLoginScreen from './PostLoginScreen.tsx';
import AdminMenu from './UserMenus/Admin/AdminMenu.tsx';
import TesterMenu from './UserMenus/Tester/TesterMenu.tsx';
import TrainerMenu from './UserMenus/Trainer/TrainerMenu.tsx';
import TrainerUserMenu from './UserMenus/User/TrainerUser/TrainerUserMenu.tsx';
import BasicUserMenu from './UserMenus/User/BasicUser/BasicUserMenu.tsx';

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PostLoginScreen />} />
                <Route path="/adminMenu" element={<AdminMenu />} />
                <Route path="/testerMenu" element={<TesterMenu />} />
                <Route path="/trainerMenu" element={<TrainerMenu />} />
                <Route path="/trainerUserMenu" element={<TrainerUserMenu />} />
                <Route path="/basicUserMenu" element={<BasicUserMenu />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
