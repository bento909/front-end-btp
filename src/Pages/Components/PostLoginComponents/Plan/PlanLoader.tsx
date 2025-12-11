// components/UserPlan/PlanLoader.tsx
// This component is responsible for:
//
// Fetching plans
//
// Managing loading and error states
//
// Delegating to PlanCreator if there's no plan
//
// Delegating to PlanEditor if a plan exists

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlanCreator from "./PlanCreator.tsx";
import PlanEditor from "./PlanEditor.tsx";
import { fetchPlanByClientEmailThunk } from "../../../../redux/plansSlice.tsx";
import { AppDispatch, RootState } from "../../../../redux/store.tsx";

// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";

interface Props {
    userName: string;
    userEmail: string;
}

const PlanLoader: React.FC<Props> = ({ userName, userEmail }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { plan, loading, error } = useSelector((state: RootState) => state.plans);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (userEmail) {
            dispatch(fetchPlanByClientEmailThunk(userEmail));
        }
    }, [userEmail, dispatch]);

    if (loading) return <p>Loading plan…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return plan ? (
        <PlanEditor
            plan={plan}
            userName={userName}
            onRefreshPlan={() => dispatch(fetchPlanByClientEmailThunk(userEmail)).unwrap()}
            expandedDays={expandedDays}
            setExpandedDays={setExpandedDays}
        />
    ) : (
        <PlanCreator userName={userName} userEmail={userEmail} onCreated={() => dispatch(fetchPlanByClientEmailThunk(userEmail))} />
    );
};

export default PlanLoader;