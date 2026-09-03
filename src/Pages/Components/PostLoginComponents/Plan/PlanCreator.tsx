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
import { client } from "../../../../graphql/graphqlClient.ts";
import { CreatePlanInput, CreatePlanMutation, CreatePlanDayMutation, DayOfWeek } from "../../../../graphql/types.ts";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createPlan, deletePlan } from "../../../../graphql/mutations.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store.tsx";
import {CreatePlanDayInput} from "../../../../graphql/PlanDay/planDayTypes.ts";
import {createPlanDay, deletePlanDay} from "../../../../graphql/PlanDay/planDayMutations.ts";

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
                organizationId: user.organizationId,
                staffGroup: `${user.organizationId}-staff`,
            };

            const planRes = (await client.graphql({
                query: createPlan,
                variables: { input: planInput },
                authMode: "userPool",
            })) as GraphQLResult<CreatePlanMutation>;

            const newPlan = planRes.data?.createPlan;
            if (!newPlan) {
                setError("Failed to create Plan");
                setCreating(false);
                return;
            }
            // 2. Create days — fired in parallel (BTP-5), not one at a time,
            // since the requests don't depend on each other.
            const dayInputs: CreatePlanDayInput[] = planType === "WEEK"
                ? WEEK_DAYS.map((dayOfWeek, i) => ({
                    planId: newPlan.id,
                    dayOfWeek,
                    dayNumber: i + 1,
                    organizationId: user.organizationId,
                    staffGroup: `${user.organizationId}-staff`,
                }))
                : Array.from({ length: customDays }, (_, i) => ({
                    planId: newPlan.id,
                    dayNumber: i + 1,
                    organizationId: user.organizationId,
                    staffGroup: `${user.organizationId}-staff`,
                }));

            const dayResults = await Promise.allSettled(
                dayInputs.map((input) =>
                    client.graphql({
                        query: createPlanDay,
                        variables: { input },
                        authMode: "userPool",
                    }) as Promise<GraphQLResult<CreatePlanDayMutation>>
                )
            );

            const failedCount = dayResults.filter((r) => r.status === "rejected").length;
            if (failedCount > 0) {
                // Compensating cleanup: not atomic at the API level, so undo
                // by hand — delete whichever days *did* get created, then
                // the plan itself, rather than leaving an orphaned partial
                // plan with no UI recovery path.
                const succeededIds = dayResults
                    .filter((r): r is PromiseFulfilledResult<GraphQLResult<CreatePlanDayMutation>> => r.status === "fulfilled")
                    .map((r) => r.value.data?.createPlanDay?.id)
                    .filter((id): id is string => !!id);

                await Promise.allSettled(
                    succeededIds.map((id) =>
                        client.graphql({
                            query: deletePlanDay,
                            variables: { input: { id } },
                            authMode: "userPool",
                        })
                    )
                );
                try {
                    await client.graphql({
                        query: deletePlan,
                        variables: { input: { id: newPlan.id } },
                        authMode: "userPool",
                    });
                } catch {
                    // best-effort cleanup; already reporting failure to the user below
                }

                setError(`Failed to create ${failedCount} of ${dayInputs.length} plan days — the partial plan was cleaned up automatically. Please try again.`);
                setCreating(false);
                return;
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
