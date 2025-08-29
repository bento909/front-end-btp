import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../Constants/constants.tsx';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.tsx";

const PostLoginScreen = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.auth.loading);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            console.log('User profile:', user.profile);
            if (user.profile === Profile.TESTER) {
                navigate('/testerMenu'); //this is a bit wank
            } else {
                navigate('/trainingMenu');
            }
        }
    }, [loading, user, navigate]);

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return null;
};

export default PostLoginScreen;
