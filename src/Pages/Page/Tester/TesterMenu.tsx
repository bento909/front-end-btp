import { Profile } from "../../../Constants/constants.tsx";
import { useNavigate } from "react-router-dom";
import { PermissionService } from "../../../Helpers/PermissionService.tsx";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store.tsx";
import { updateAuthUser } from "../../../redux/authSlice.tsx";

const TesterMenu = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    function handleNameChange(role: string) {
        const testName = role  + ' (test mode)';
        dispatch(updateAuthUser({
                profile: role as Profile,
                name: testName,
                permissions: PermissionService.getPermissions(role as Profile),
                emailAddress: 'test@test.test',
                creator: user ? user.emailAddress : 'Something odd has happened!'
            })
        );
        navigate("/");
    }

    return (
        <main>
            <h1>Hello, this is the page for you, the tester</h1>
            <h2>When you click one of the below roles you will magically take on their powers</h2>
            <ul>
                {Object.values(Profile).map((role) => (
                    <li key={role as string} onClick={() => handleNameChange(role)}>
                        {role as string}
                    </li>
                ))}
            </ul>
        </main>
    );
};

export default TesterMenu;