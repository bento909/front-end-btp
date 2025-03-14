import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { UserTypes } from './constants.ts';

async function fetchUserRole() {
    try {
        console.log('What is going on?')
        const { username, userId, signInDetails } = await getCurrentUser();
        console.log('Yo` Mamma`s G-HAT')
        console.log(username)
        console.log(userId)
        console.log(signInDetails)
        console.log('Every moment in lieu of a lifetime SUCKS')
        // const userRole = user.attributes['custom:role']; // Retrieve custom role
        // return userRole;
    } catch (error) {
        console.error('Error fetching user role:', error);
    }
    return UserTypes.ADMIN; // Temporary role assignment for demonstration
}

const PostLoginScreen = () => {
    const navigate = useNavigate();

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
