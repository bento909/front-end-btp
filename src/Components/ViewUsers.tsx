import { useUserAttributes } from "../PermissionsProvider/UserAttributesContext.tsx";
import { User, ViewUsers } from "../Constants/constants.ts";
import { useEffect, useState } from "react";
import CollapsiblePanel from "../Styles/CollapsiblePanel.tsx";
import { fetchUsers } from "../Api/FetchUsers.tsx"; // Import fetchUsers function

// User Form Component
interface GetUserListProps {
    user: User;
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserList: React.FC<GetUserListProps> = ({ user }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        console.log("Current User:", user);

        const getUsers = async () => {
            const data = await fetchUsers();
            if (data) {
                setUsers(data);
            }
        };

        getUsers();
    }, [user]);

    return (users ?
        <ul>
            {users.map((u) => (
                <li>{u.name}</li>
            ))}
        </ul> :
            <div>You don't have any clients. Loser :p</div>
    );
};

const ViewAllUsers: React.FC = () => {
    const { user } = useUserAttributes();
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleForm = () => setIsFormVisible(!isFormVisible);

    return user && user.permissions?.viewUsers !== ViewUsers.NONE ? (
        <CollapsiblePanel title="Users" isOpen={isFormVisible} toggle={toggleForm}>
            <UserList user={user} toggleForm={toggleForm} isFormVisible={isFormVisible} />
        </CollapsiblePanel>
    ) : null;
};

export default ViewAllUsers;
