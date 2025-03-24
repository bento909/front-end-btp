import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../Constants/constants.tsx';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const PostLoginScreen = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    useEffect(() => {
        const handleUserLogin = async () => {
            const role = user ? user.profile : Profile.BASIC_USER
            if (role === Profile.TESTER) {
                navigate('/testerMenu');
            } else  {
                navigate('/adminMenu');
            }
        };
        handleUserLogin();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default PostLoginScreen;
