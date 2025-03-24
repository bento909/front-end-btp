import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../Constants/constants.tsx';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.tsx";

const user = useSelector((state: RootState) => state.auth.user);

const PostLoginScreen = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if (user) {
            const handleUserLogin = async () => {
                const role = user ? user.profile : Profile.BASIC_USER
                console.log('my role is ' + role)
                if (role === Profile.TESTER) {
                    console.log('navigating to tester menu')
                    navigate('/testerMenu');
                } else {
                    console.log('navigating to admin menu')
                    navigate('/adminMenu');
                }
            };
            handleUserLogin();
        }
    }, [navigate, user]);

    return <div>Loading...</div>;
};

export default PostLoginScreen;
