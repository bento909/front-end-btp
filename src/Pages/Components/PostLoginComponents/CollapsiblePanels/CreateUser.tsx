import { useState, useEffect } from "react";
import { Profile, User } from "../../../../Constants/constants.tsx";
import CollapsiblePanel from "../../../../Styles/CollapsiblePanel.tsx";
import { useSelector, useDispatch } from "react-redux";
import {AppDispatch, RootState} from "../../../../redux/store.tsx";
import { fetchUsersThunk } from "../../../../redux/usersSlice.tsx";
import { dataClient } from "../../../../graphql/dataClient.ts";

// Creates a user server-side via the createOrgUser custom mutation
// (amplify/functions/createOrgUser). The caller's org and permitted target
// roles are enforced inside that function from the caller's own verified
// identity — never trust anything client-supplied for that decision. This
// replaces the old direct-from-browser AdminCreateUserCommand call, which
// used a dead Cognito Identity Pool ID and an authenticated role with zero
// attached policies, so it could never actually have succeeded.
export const signUpUser = async (email: string, name: string, newUserProfile: Profile) => {
    const response = await dataClient.mutations.createOrgUser({
        email,
        name,
        role: newUserProfile,
    });

    if (response.errors?.length) {
        throw new Error(response.errors.map((e) => e.message).join("; "));
    }
    if (!response.data?.success) {
        throw new Error(response.data?.message || "User creation failed");
    }

    return response.data;
};

// User Form Component
interface CreateUserFormProps {
    user: User;
    toggleForm: () => void;
    isFormVisible: boolean;
}

const UserForm: React.FC<CreateUserFormProps> = ({ user }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [profile, setProfile] = useState<Profile | "">("");
    const [message, setMessage] = useState("");
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (user.permissions.createUsers.length > 0) {
            setProfile(user.permissions.createUsers[0]);
        }
    }, [user.permissions.createUsers]);

    const handleSignUp = async () => {
        if (!profile || !name) {
            setMessage("Please enter a name and select a profile.");
            return;
        }
        try {
            const result = await signUpUser(email, name, profile);
            dispatch(fetchUsersThunk());
            setMessage(result.message || "Signup successful! The new user will receive their temporary password by email.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Error signing up. Please try again.");
        }
    };

    return (
        <>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
                {user.permissions.createUsers.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <button onClick={handleSignUp}>Sign Up</button>
            {message && <p>{message}</p>}
        </>
    );
};

const Signup: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const toggleForm = () => setIsFormVisible(!isFormVisible);

    return user && user.permissions.createUsers.length > 0 && (
        <CollapsiblePanel title="Create a user" isOpen={isFormVisible} toggle={toggleForm}>
            <UserForm user={user} toggleForm={toggleForm} isFormVisible={isFormVisible} />
        </CollapsiblePanel>
    );
};

export default Signup;
