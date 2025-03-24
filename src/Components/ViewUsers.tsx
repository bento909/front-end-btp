import { ViewUsers } from "../Constants/constants.tsx";
import { useEffect, useState } from "react";
import CollapsiblePanel from "../Styles/CollapsiblePanel.tsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersThunk } from "../redux/usersSlice";
import { RootState, AppDispatch } from "../redux/store";

// User Form Component
interface GetUserListProps {
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserList: React.FC<GetUserListProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error } = useSelector((state: RootState) => state.users);
    useEffect(() => {
        dispatch(fetchUsersThunk());
    }, [dispatch]);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return users.length ? (
        <ul>
            {users.map((user) => (
                <li key={user.id}>{user.name} ({user.emailAddress})</li>
            ))}
        </ul>
    ) : (
        <div>No users found.</div>
    );
};

const ViewAllUsers: React.FC = () => {
    const user =  useSelector((state: RootState) => state.auth.user);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleForm = () => setIsFormVisible(!isFormVisible);

    return user && user.permissions?.viewUsers !== ViewUsers.NONE ? (
        <CollapsiblePanel title="Users" isOpen={isFormVisible} toggle={toggleForm}>
            <UserList toggleForm={toggleForm} isFormVisible={isFormVisible} />
        </CollapsiblePanel>
    ) : null;
};

export default ViewAllUsers;
