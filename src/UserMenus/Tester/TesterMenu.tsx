import { Profile } from "../../Constants/constants.ts";

const TesterMenu = () => {
    return (
        <main>
            <h1>Hello, this is the page for you, the tester</h1>
            <h2>When you log in you will be able to impersonate all roles</h2>
            <ul>
                {Object.values(Profile).map((role) => (
                    <li key={role as string}>{role as string}</li>
                ))}
            </ul>
        </main>
    );
};

export default TesterMenu