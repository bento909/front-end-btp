import { Profile } from "../../Constants/constants.ts";
import { useUserAttributes } from "../../PermissionsProvider/UserAttributesContext.tsx";
import { useNavigate } from "react-router-dom";

const TesterMenu = () => {
    const { changeUserAttributes } = useUserAttributes(); // Get changeUserAttributes from context
    const navigate = useNavigate();

    function handleNameChange(role: string) {
        changeUserAttributes({ profile: role as Profile, name: 'Gobshite' });
        console.log('You fucken druggo')
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