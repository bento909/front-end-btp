import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../Constants/constants.ts';
import { useUserAttributes } from "../PermissionsProvider/UserAttributesContext.tsx"

const PostLoginScreen = () => {
    const { user } = useUserAttributes();
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
