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
import { client } from "../../graphql/graphqlClient";
import { GraphQLQueries } from "../../graphql/queries";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListPlansQuery } from "../../graphql/types";
import PlanCreator from "./PlanCreator";
import PlanEditor from "./PlanEditor";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store";

interface Props {
    userName: string;
    userEmail: string;
}

const PlanLoader: React.FC<Props> = ({ userName, userEmail }) => {
    // const user = useSelector((state: RootState) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<ListPlansQuery["listPlans"]["items"][0] | null>(null);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const resp = (await client.graphql({
                query: GraphQLQueries.listPlans,
            })) as GraphQLResult<ListPlansQuery>;

            const all = resp.data?.listPlans.items ?? [];
            setPlan(all.find(p => p.clientEmail === userEmail) ?? null);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Error loading plan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [userEmail]);

    if (loading) return <p>Loading plan…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return plan ? (
        <PlanEditor
            plan={plan}
            userName={userName}
            onRefreshPlan={fetchPlans}
            expandedDays={expandedDays}
            setExpandedDays={setExpandedDays}
        />
    ) : (
        <PlanCreator userName={userName} userEmail={userEmail} onCreated={fetchPlans} />
    );
};

export default PlanLoader;
