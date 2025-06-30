import { useEffect, useState } from "react";
import { client } from "../../graphql/graphqlClient";
import { GraphQLQueries } from "../../graphql/queries";
import { ListPlansQuery, DayOfWeek, CreatePlanInput, CreatePlanMutation } from "../../graphql/types";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createPlan } from "../../graphql/mutations";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";

interface Props {
    userName: string;
    userEmail: string;
}

const formatDay = (day: DayOfWeek): string =>
    day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

const UserPlanView: React.FC<Props> = ({ userName, userEmail }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<ListPlansQuery["listPlans"]["items"][0] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

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

    // Create the Plan itself (no days yet)
    const handleCreatePlan = async (type: "WEEK" | "CUSTOM") => {
        if (!user) {
            console.error("No logged in user!");
            return;
        }

        setCreating(true);
        try {
            const input: CreatePlanInput = {
                name: type === "WEEK"
                    ? `${userName}'s Weekly Plan`
                    : `${userName}'s Custom Plan`,
                trainerEmail: user.emailAddress,
                clientEmail: userEmail,
            };

            const res = (await client.graphql({
                query: createPlan,
                variables: { input },
            })) as GraphQLResult<CreatePlanMutation>;

            if (res.data?.createPlan) {
                // we now have the plan; next step is to create days
                setPlan({
                    ...res.data.createPlan,
                    planDays: { items: [] },
                });
                // TODO: for "WEEK" → create 7 planDays (MON→SUN)
                //       for "CUSTOM" → prompt for N days, then create
            }
        } catch (e) {
            console.error(e);
            setError("Could not create plan");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p>Loading plan for {userName}…</p>;
    if (error)   return <p style={{ color: "red" }}>{error}</p>;

    // No plan yet → show two create buttons
    if (!plan) {
        return (
            <div>
                <p>No plan yet for {userName}.</p>
                <button onClick={() => handleCreatePlan("WEEK")} disabled={creating}>
                    {creating ? "Creating…" : "Create Week Plan"}
                </button>
                <button
                    onClick={() => handleCreatePlan("CUSTOM")}
                    disabled={creating}
                    style={{ marginLeft: "1rem" }}
                >
                    {creating ? "Creating…" : "Create Custom Days Plan"}
                </button>
            </div>
        );
    }

    // Plan exists → show days & exercises as before...
    return (
        <div>
            <h4>Plan: {plan.name}</h4>
            <ul>
                {plan.planDays.items.map((day) => (
                    <li key={day.id} style={{ marginBottom: 8 }}>
                        <strong>
                            {day.dayOfWeek
                                ? formatDay(day.dayOfWeek)
                                : `Day ${day.dayNumber}`}
                        </strong>
                        <ul>
                            {day.planExercises.items.length === 0
                                ? <li>No exercises for this day</li>
                                : day.planExercises.items.map(ex => (
                                    <li key={ex.id}>
                                        Order: {ex.order}, Reps: {ex.suggestedReps ?? "-"},
                                        Weight: {ex.suggestedWeight ?? "-"}
                                    </li>
                                ))
                            }
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserPlanView;
