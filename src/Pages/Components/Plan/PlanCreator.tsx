//This component handles:
//
// Choosing a plan type (WEEK or CUSTOM)
//
// Entering number of days (for custom)
//
// Creating a plan and associated plan days
//
// Notifying the parent to reload plans via onCreated
import { useState } from "react";
import { client } from "../../../graphql/graphqlClient.ts";
import { CreatePlanInput, CreatePlanDayInput, CreatePlanMutation, CreatePlanDayMutation, DayOfWeek } from "../../../graphql/types.ts";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createPlan, createPlanDay } from "../../../graphql/mutations.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store.tsx";

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];

type PlanType = "WEEK" | "CUSTOM";

interface Props {
    userName: string;
    userEmail: string;
    onCreated: () => void;
}

const PlanCreator: React.FC<Props> = ({ userName, userEmail, onCreated }) => {
    const user = useSelector((s: RootState) => s.auth.user);
    const [planType, setPlanType] = useState<PlanType | null>(null);
    const [customDays, setCustomDays] = useState<number>(7);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreatePlan = async () => {
        if (!user || !planType) return;
        setCreating(true);
        setError(null);

        try {
            // 1. Create plan
            const planInput: CreatePlanInput = {
                name: planType === "WEEK" ? `${userName}'s Weekly Plan` : `${userName}'s ${customDays}-Day Plan`,
                trainerEmail: user.emailAddress,
                clientEmail: userEmail,
            };

            const planRes = (await client.graphql({
                query: createPlan,
                variables: { input: planInput },
            })) as GraphQLResult<CreatePlanMutation>;

            const newPlan = planRes.data?.createPlan;
            if (!newPlan) {
                setError("Failed to create Plan");
                setCreating(false);
                return;
            }
            // 2. Create days
            if (planType === "WEEK") {
                for (let i = 0; i < WEEK_DAYS.length; i++) {
                    const input: CreatePlanDayInput = {
                        planId: newPlan.id,
                        dayOfWeek: WEEK_DAYS[i],
                        dayNumber: i + 1,
                    };
                    await client.graphql({
                        query: createPlanDay,
                        variables: { input },
                    }) as GraphQLResult<CreatePlanDayMutation>;
                }
            } else {
                for (let i = 1; i <= customDays; i++) {
                    const input: CreatePlanDayInput = {
                        planId: newPlan.id,
                        dayNumber: i,
                    };
                    await client.graphql({
                        query: createPlanDay,
                        variables: { input },
                    }) as GraphQLResult<CreatePlanDayMutation>;
                }
            }

            onCreated();
        } catch (e) {
            console.error(e);
            setError("Could not create plan and days");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <p>No plan yet for {userName}.</p>

            {!planType ? (
                <>
                    <button onClick={() => setPlanType("WEEK")} disabled={creating}>
                        Create Week Plan
                    </button>
                    <button onClick={() => setPlanType("CUSTOM")} disabled={creating} style={{ marginLeft: 8 }}>
                        Create Custom Days Plan
                    </button>
                </>
            ) : planType === "CUSTOM" ? (
                <>
                    <p>How many days should this plan have?</p>
                    <input
                        type="number"
                        min={1}
                        value={customDays}
                        onChange={e => setCustomDays(parseInt(e.target.value, 10) || 1)}
                    />
                    <button onClick={handleCreatePlan} disabled={creating}>
                        {creating ? "Creating…" : "Create Custom Plan"}
                    </button>
                    <button onClick={() => setPlanType(null)} disabled={creating} style={{ marginLeft: 8 }}>
                        Cancel
                    </button>
                </>
            ) : (
                <button onClick={handleCreatePlan} disabled={creating}>
                    {creating ? "Creating…" : "Create Week Plan"}
                </button>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default PlanCreator;
