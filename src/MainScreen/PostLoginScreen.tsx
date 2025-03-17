import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchUserAttributes  } from 'aws-amplify/auth';
import { Profile } from '../Constants/constants.ts';
import { userCache } from '../PermissionsProvider/userCache.tsx'
import {useUserAttributes} from "../PermissionsProvider/UserAttributesContext.tsx";

async function fetchUserRole() {
    try {
        const theUser = await getCurrentUser();
        const twammer = await fetchUserAttributes();
        console.log('profile:', twammer.profile);
        console.log('Full user object:', theUser);
        console.log('Full authenticated user object:', twammer);

        console.log('What is going on?')
        console.log('Yo` Mamma`s G-HAT')
        console.log('Every moment in lieu of a lifetime SUCKS')

        // const userRole = user.attributes['custom:role']; // Retrieve custom role
        console.log('This should print out the user:')
        const user = userCache.getUser();
        console.log(user);

    } catch (error) {
        console.error('Error fetching user role:', error);
    }
    return Profile.ADMIN; // Temporary role assignment for demonstration
}

const PostLoginScreen = () => {
    const blollokc = useUserAttributes();
    console.log('About to give it bifters:')
    console.log(blollokc)
    console.log('We just gave it bifters:')

    const navigate = useNavigate();
//TODO don't do this, Just navigate to a Main Page and Show Bits by Permissions
    useEffect(() => {
        const handleUserLogin = async () => {
            const role = await fetchUserRole();
            if (role === Profile.ADMIN) {
                navigate('/adminMenu');
            } else if (role === Profile.TESTER) {
                navigate('/testerMenu');
            } else if (role === Profile.TRAINER) {
                navigate('/trainerMenu');
            } else if (role === Profile.TRAINER_USER) {
                navigate('/trainerUserMenu');
            } else if (role === Profile.BASIC_USER) {
                navigate('/basicUserMenu');
            }
        };
        handleUserLogin();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default PostLoginScreen;
