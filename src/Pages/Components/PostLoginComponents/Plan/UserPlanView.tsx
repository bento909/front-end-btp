import PlanLoader from "./PlanLoader.tsx";

interface Props {
    userName: string;
    userEmail: string;
}

const UserPlanView: React.FC<Props> = ({ userName, userEmail }) => {
    // no need for planCreated or forceReload
    return <PlanLoader userName={userName} userEmail={userEmail} />;
};

export default UserPlanView;
