import SignUp from '../Components/CollapsiblePanels/CreateUser.tsx';
import ViewAllUsers from "../Components/CollapsiblePanels/ViewUsers.tsx";
import CreateExercise from "../Components/CollapsiblePanels/CreateExercise.tsx";
import ListExercises from "../Components/CollapsiblePanels/ListExercises.tsx";
import EditPlans from "../Components/CollapsiblePanels/EditPlans.tsx"

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
