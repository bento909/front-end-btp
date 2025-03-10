import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';

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
    return 'admin'; // Temporary role assignment for demonstration
}

const PostLoginScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleUserLogin = async () => {
            const role = await fetchUserRole();
            if (role === 'admin') {
                navigate('/adminMenu');
            } else if (role === 'tester') {
                navigate('/testerMenu');
            } else if (role === 'trainer') {
                navigate('/trainerMenu');
            } else if (role === 'trainer_user') {
                navigate('/trainerUserMenu');
            } else if (role === 'basic_user') {
                navigate('/basicUserMenu');
            }
        };

        handleUserLogin();
    }, [navigate]);

    return <div>Loading...</div>;
};

export default PostLoginScreen;
