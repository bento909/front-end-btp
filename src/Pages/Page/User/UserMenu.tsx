import SignUp from '../../Components/CreateUser.tsx';
import ViewAllUsers from "../../Components/ViewUsers.tsx";
import CreateExercise from "../../Components/CreateExercise.tsx";
import ListExercises from "../../Components/ListExercises.tsx";
import EditPlans from "../../Components/EditPlans.tsx"

const UserMenu = () => {
    return (
        <main>
            <ViewAllUsers/>
            <SignUp/>
            <CreateExercise/>
            <ListExercises/>
            <EditPlans/>
        </main>
    );
};

export default UserMenu
