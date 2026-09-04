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
import { fetchPlanDaysThunk } from "../../../../redux/planDaysSlice.tsx";
import { AppDispatch, RootState } from "../../../../redux/store.tsx";

interface Props {
    userName: string;
    userEmail: string;
}

const PlanLoader: React.FC<Props> = ({ userName, userEmail }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { plan, loading, error } = useSelector((state: RootState) => state.plans);
    const { loading: daysLoading } = useSelector((state: RootState) => state.planDays);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (userEmail) {
            dispatch(fetchPlanByClientEmailThunk(userEmail));
        }
    }, [userEmail, dispatch]);

    useEffect(() => {
        if (plan) {
            dispatch(fetchPlanDaysThunk(plan.id!));
        }
    }, [plan?.id, dispatch]);

    const refreshPlan = async () => {
        const refreshed = await dispatch(fetchPlanByClientEmailThunk(userEmail)).unwrap();
        if (refreshed) {
            await dispatch(fetchPlanDaysThunk(refreshed.id!));
        }
    };

    if (loading || (plan && daysLoading)) return <p>Loading plan…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return plan ? (
        <PlanEditor
            plan={plan}
            userName={userName}
            onRefreshPlan={refreshPlan}
            expandedDays={expandedDays}
            setExpandedDays={setExpandedDays}
        />
    ) : (
        <PlanCreator userName={userName} userEmail={userEmail} onCreated={refreshPlan} />
    );
};

export default PlanLoader;
