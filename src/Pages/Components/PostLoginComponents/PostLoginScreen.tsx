import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store.tsx";

const PostLoginScreen = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.auth.loading);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/app/trainingMenu');
        }
    }, [loading, user, navigate]);

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return null;
};

export default PostLoginScreen;
