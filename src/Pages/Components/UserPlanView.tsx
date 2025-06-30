import { useEffect, useState } from "react";
import { client } from "../../graphql/graphqlClient";
import { GraphQLQueries } from "../../graphql/queries";
import {
    ListPlansQuery,
    DayOfWeek,
    CreatePlanInput,
    CreatePlanMutation,
    CreatePlanDayInput,
    CreatePlanDayMutation,
} from "../../graphql/types";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createPlan, createPlanDay } from "../../graphql/mutations";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface Props {
    userName: string;
    userEmail: string;
}

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const formatDay = (day: DayOfWeek): string =>
    day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

type PlanType = "WEEK" | "CUSTOM";

const UserPlanView: React.FC<Props> = ({ userName, userEmail }) => {
    const user = useSelector((s: RootState) => s.auth.user);
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<ListPlansQuery["listPlans"]["items"][0] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    // track which plan type user chose (only used while plan===null)
    const [planType, setPlanType] = useState<PlanType | null>(null);
    const [customDays, setCustomDays] = useState<number>(7);

    // track expand/collapse for days
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    // Fetch existing plan
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const resp = (await client.graphql({
                    query: GraphQLQueries.listPlans,
                })) as GraphQLResult<ListPlansQuery>;
                const all = resp.data?.listPlans.items ?? [];
                setPlan(all.find(p => p.clientEmail === userEmail) ?? null);
            } catch (e) {
                console.error(e);
                setError("Error loading plan");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [userEmail]);

    // Create Plan + Days
    const handleCreatePlan = async () => {
        if (!user || !planType) return;
        setCreating(true);
        try {
            // 1) Create the Plan
            const planInput: CreatePlanInput = {
                name:
                    planType === "WEEK"
                        ? `${userName}'s Weekly Plan`
                        : `${userName}'s ${customDays}-Day Plan`,
                trainerEmail: user.emailAddress,
                clientEmail: userEmail,
            };
            const planRes = (await client.graphql({
                query: createPlan,
                variables: { input: planInput },
            })) as GraphQLResult<CreatePlanMutation>;
            const newPlan = planRes.data?.createPlan;
            if (!newPlan) throw new Error("Failed to create Plan");

            // 2) Optimistically set plan with empty days
            setPlan({ ...newPlan, planDays: { items: [] } });

            // 3) Create the days
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

            // 4) Reload the full plan (with days)
            setLoading(true);
            const reload = (await client.graphql({
                query: GraphQLQueries.listPlans,
            })) as GraphQLResult<ListPlansQuery>;
            const all = reload.data?.listPlans.items ?? [];
            setPlan(all.find(p => p.clientEmail === userEmail) ?? null);
        } catch (e) {
            console.error(e);
            setError("Could not create plan and days");
        } finally {
            setCreating(false);
            setLoading(false);
        }
    };

    // Expand/collapse a day
    const onToggle = (id: string) =>
        setExpandedDays(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    if (loading) return <p>Loading plan…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // no plan → plan‐creation UI
    if (!plan) {
        return (
            <div>
                <p>No plan yet for {userName}.</p>
                {!planType ? (
                    <>
                        <button onClick={() => setPlanType("WEEK")} disabled={creating}>
                            Create Week Plan
                        </button>
                        <button
                            onClick={() => setPlanType("CUSTOM")}
                            disabled={creating}
                            style={{ marginLeft: 8 }}
                        >
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
                        <button
                            onClick={() => setPlanType(null)}
                            disabled={creating}
                            style={{ marginLeft: 8 }}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={handleCreatePlan} disabled={creating}>
                        {creating ? "Creating…" : "Create Week Plan"}
                    </button>
                )}
            </div>
        );
    }

    // plan exists → show days & exercises
    const usesDayOfWeek = plan.planDays.items.every(d => Boolean(d.dayOfWeek));
    const sorted = [...plan.planDays.items].sort((a, b) =>
        usesDayOfWeek
            ? WEEK_DAYS.indexOf(a.dayOfWeek!) - WEEK_DAYS.indexOf(b.dayOfWeek!)
            : a.dayNumber - b.dayNumber
    );

    return (
        <div>
            <h4>{plan.name}</h4>
            {usesDayOfWeek ? (
                <ul>
                    {sorted.map(day => (
                        <ul key={day.id}>
                            <button onClick={() => onToggle(day.id)}>
                                {formatDay(day.dayOfWeek!)}{" "}
                                {expandedDays.has(day.id) ? "▲" : "▼"}
                            </button>
                            {expandedDays.has(day.id) && (
                                <ul style={{ marginLeft: 16 }}>
                                    {day.planExercises.items.length === 0 ? (
                                        <li>No exercises</li>
                                    ) : (
                                        day.planExercises.items.map(ex => (
                                            <li key={ex.id}>
                                                Order {ex.order}, Reps {ex.suggestedReps}, Weight{" "}
                                                {ex.suggestedWeight}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </ul>
                    ))}
                </ul>
            ) : (
                <ul>
                    {sorted.map(day => (
                        <li key={day.id}>
                            <button onClick={() => onToggle(day.id)}>
                                Day {day.dayNumber} {expandedDays.has(day.id) ? "▲" : "▼"}
                            </button>
                            {expandedDays.has(day.id) && (
                                <ul style={{ marginLeft: 16 }}>
                                    {day.planExercises.items.length === 0 ? (
                                        <li>No exercises</li>
                                    ) : (
                                        day.planExercises.items.map(ex => (
                                            <li key={ex.id}>
                                                Order {ex.order}, Reps {ex.suggestedReps}, Weight{" "}
                                                {ex.suggestedWeight}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserPlanView;
