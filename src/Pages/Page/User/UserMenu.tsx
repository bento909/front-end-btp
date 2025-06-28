import SignUp from '../../Components/CreateUser.tsx';
import ViewAllUsers from "../../Components/ViewUsers.tsx";
import CreateExercise from "../../Components/CreateExercise.tsx";
import ListExercises from "../../Components/ListExercises.tsx";

const UserMenu = () => {
    return (
        <main>
            <ul>
                <li>Todo More stuff</li>
            </ul>
            <ViewAllUsers/>
            <SignUp/>
            <CreateExercise/>
            <ListExercises/>
        </main>
    );
};

export default UserMenu
