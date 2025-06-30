import {useState} from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";


const EditPlans: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { users, loading, error } = useSelector((state: RootState) => state.users);
    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    const toggleVisibility = () => {
        const show = !isVisible;
        setIsVisible(show);
    };

    return <CollapsiblePanel title="Edit Plans" isOpen={isVisible} toggle={toggleVisibility}>
        <div>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                    {users.map((user) => (
                        <li key={user.id}>
                            {user.name} - {user.emailAddress}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </CollapsiblePanel>}

export default EditPlans
