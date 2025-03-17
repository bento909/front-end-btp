import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../Constants/constants.ts';
import {useUserAttributes} from "../PermissionsProvider/UserAttributesContext.tsx";

const PostLoginScreen = () => {
    const blollokc = useUserAttributes();
    console.log('About to give it bifters:')
    console.log(blollokc)
    console.log('We just gave it bifters:')

    const navigate = useNavigate();
    useEffect(() => {
        const handleUserLogin = async () => {
            const role = blollokc.profile
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
