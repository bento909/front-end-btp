import React, {useState, useEffect} from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import {useSelector, useDispatch} from "react-redux";
import {AppDispatch, RootState} from "../../../redux/store.tsx";
import {fetchUsersThunk} from "../../../redux/usersSlice.tsx"; // Adjust path as needed
import UserPlanView from "../Plan/UserPlanView.tsx"
import {canCreatePlan} from "../../../Constants/constants.tsx";

const EditPlans: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isVisible, setIsVisible] = useState(false);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const {users, loading, error} = useSelector((state: RootState) => state.users);

    const toggleVisibility = () => {
        const show = !isVisible;
        setIsVisible(show);
    };

    useEffect(() => {
        if (isVisible && users.length === 0 && !loading && !error) {
            dispatch(fetchUsersThunk());
        }
    }, [isVisible, users.length, loading, error, dispatch]);

    const toggleUser = (userId: string) => {
        setExpandedUserId(prev => (prev === userId ? null : userId));
    };

    return user && canCreatePlan(user) ? (
        <CollapsiblePanel title="Plans" isOpen={isVisible} toggle={toggleVisibility}>
            <div>
                {loading && <p>Loading users...</p>}
                {error && <p>Error: {error}</p>}
                {!loading && users.length === 0 && <p>No users found.</p>}
                {!loading && users.length > 0 && (
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                <button onClick={() => toggleUser(user.id)}>
                                    {user.name} - {user.emailAddress}
                                </button>
                                {expandedUserId === user.id && (
                                    <UserPlanView userName={user.name} userEmail={user.emailAddress}/>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </CollapsiblePanel>
    ) : null;
};

export default EditPlans;
