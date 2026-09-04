import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PostLoginScreen from './Pages/Components/PostLoginComponents/PostLoginScreen.tsx';
import Layout from "./Pages/Components/Layout.tsx";
import LandingPage from "./Pages/Landing/LandingPage.tsx"
import {Authenticator} from "@aws-amplify/ui-react";
import SignUp from "./Pages/Components/PostLoginComponents/CollapsiblePanels/CreateUser.tsx";
import ViewAllUsers from "./Pages/Components/PostLoginComponents/CollapsiblePanels/ViewUsers.tsx";
import CreateExercise from "./Pages/Components/PostLoginComponents/CollapsiblePanels/CreateExercise.tsx";
import ListExercises from "./Pages/Components/PostLoginComponents/CollapsiblePanels/ListExercises.tsx";
import EditPlans from "./Pages/Components/PostLoginComponents/CollapsiblePanels/EditPlans.tsx"
import ViewPlan from "./Pages/Components/PostLoginComponents/CollapsiblePanels/ViewPlan.tsx"
import ViewMessages from "./Pages/Components/PostLoginComponents/CollapsiblePanels/ViewMessages.tsx";
import CreateOrganization from "./Pages/Components/PostLoginComponents/CollapsiblePanels/CreateOrganization.tsx";
import {useTimer, WorkoutTimerProvider} from "./Context/WorkoutTimerContext";
import {WorkoutTimerPopup} from "./PopupComponents/WorkoutTimerPopup.tsx";

const WorkoutTimerPopupWrapper = () => {
    const { open, title, display, stop, pause, isPaused, resume } = useTimer();
    return (
        <WorkoutTimerPopup
            open={open}
            title={title}
            display={display}
            stop={stop}
            isPaused={isPaused}
            pause={pause}
            resume={resume}
        />
    );
};

function AppRoutes() {
    return (
        <Router>
            <WorkoutTimerProvider>
                <WorkoutTimerPopupWrapper/>
                <Routes>
                    {/* Public landing page */}
                    <Route path="/" element={<LandingPage/>}/>

                    {/* Protected routes wrapped in Authenticator */}
                    <Route
                        path="/app/*"
                        element={
                            <Authenticator hideSignUp={true}>
                                <Layout>
                                    <Routes>
                                        <Route path="home" element={<PostLoginScreen/>}/>
                                        <Route path="trainingMenu" element={<Menu/>}/>
                                    </Routes>
                                </Layout>
                            </Authenticator>
                        }
                    />
                </Routes>
            </WorkoutTimerProvider>
        </Router>
    );
}

const Menu = () => {
    return (
        <main>
            <ViewMessages/>
            <CreateOrganization/>
            <ViewAllUsers/>
            <SignUp/>
            <CreateExercise/>
            <ListExercises/>
            <EditPlans/>
            <ViewPlan/>
        </main>
    );
};


export default AppRoutes;
