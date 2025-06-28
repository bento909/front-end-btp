import { ViewUsers } from "../../Constants/constants.tsx";
import { useState } from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersThunk } from "../../redux/usersSlice.tsx";
import { RootState, AppDispatch } from "../../redux/store.tsx";

// User Form Component
interface GetUserListProps {
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserList: React.FC<GetUserListProps> = () => {
    //TODO even though you might be in test mode, the Lambda that fetches the users doesn't know that - therefore we need
    //TODO to ensure that the userlist loads user as expected for all cases.
    const { users, loading, error } = useSelector((state: RootState) => state.users);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return users.length ? (
        <ul>
            {users.map((user) => (
                <li key={user.id}>
                    <div>Name: {user.name}</div>
                    <div>Email: {user.emailAddress}</div>
                    <div>Trainer: {user.creator}</div>
                </li>
            ))}
        </ul>
    ) : (
        <div>No users found.</div>
    );
};

const ViewAllUsers: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { users } = useSelector((state: RootState) => state.users);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleForm = () => {
        setIsFormVisible((prevIsVisible) => {
            const newIsVisible = !prevIsVisible;
            if (newIsVisible && users.length === 0) {
                dispatch(fetchUsersThunk());
            }
            return newIsVisible;
        });
    };

    return user && user.permissions?.viewUsers !== ViewUsers.NONE ? (
        <CollapsiblePanel title="Users" isOpen={isFormVisible} toggle={toggleForm}>
            <UserList toggleForm={toggleForm} isFormVisible={isFormVisible} />
        </CollapsiblePanel>
    ) : null;
};

export default ViewAllUsers;
