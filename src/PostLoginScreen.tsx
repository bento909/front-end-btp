import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchUserAttributes  } from 'aws-amplify/auth';
import { UserTypes } from './Constants/constants.ts';
import { userCache } from './PermissionsProvider/userCache.tsx'

async function fetchUserRole() {
    try {
        const theUser = await getCurrentUser();
        const twammer = await fetchUserAttributes();
        console.log('profile:', twammer.profile);
        console.log('Full user object:', theUser);
        console.log('Full authenticated user object:', twammer);

        console.log('What is going on?')
        console.log('Yo` Mamma`s G-HAT')
        console.log(theUser.username)
        console.log(theUser.userId)
        console.log(theUser.signInDetails)

        console.log('Every moment in lieu of a lifetime SUCKS')

        // const userRole = user.attributes['custom:role']; // Retrieve custom role
        console.log('This should print out the user:')
        console.log(userCache.getUser());

    } catch (error) {
        console.error('Error fetching user role:', error);
    }
    return UserTypes.ADMIN; // Temporary role assignment for demonstration
}

const PostLoginScreen = () => {
    const navigate = useNavigate();
//TODO don't do this, Just navigate to a Main Page and Show Bits by Permissions
    useEffect(() => {
        const handleUserLogin = async () => {
            const role = await fetchUserRole();
            if (role === UserTypes.ADMIN) {
                navigate('/adminMenu');
            } else if (role === UserTypes.TESTER) {
                navigate('/testerMenu');
            } else if (role === UserTypes.TRAINER) {
                navigate('/trainerMenu');
            } else if (role === UserTypes.TRAINER_USER) {
                navigate('/trainerUserMenu');
            } else if (role === UserTypes.BASIC_USER) {
                navigate('/basicUserMenu');
            }
        };
        handleUserLogin();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default PostLoginScreen;
