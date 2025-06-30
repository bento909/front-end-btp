import { useEffect, useState } from "react";
import { client } from "../../graphql/graphqlClient";
import { GraphQLQueries } from "../../graphql/queries";
import { ListPlansQuery, DayOfWeek } from "../../graphql/types";
import { GraphQLResult } from "@aws-amplify/api-graphql";

interface Props {
    userName: string;
    userEmail: string;
}

const formatDay = (day: DayOfWeek): string =>
    day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

const UserPlanView: React.FC<Props> = ({ userName, userEmail }) => {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<ListPlansQuery["listPlans"]["items"][0] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = (await client.graphql({
                    query: GraphQLQueries.listPlans,
                })) as GraphQLResult<ListPlansQuery>;

                const allPlans = response.data?.listPlans?.items ?? [];
                const userPlan = allPlans.find(plan => plan?.clientEmail === userEmail);

                setPlan(userPlan ?? null);
            } catch (err) {
                console.error("Error loading plan", err);
                setError("Error loading plan");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [userEmail]);

    if (loading) return <p>Loading plan for {userName}...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    if (!plan) {
        return <p>No plan yet for user {userName}</p>;
    }

    return (
        <div>
            <h4>Plan: {plan.name}</h4>
            <ul>
                {plan.planDays?.items?.map((day) => (
                    <li key={day.id} style={{ marginBottom: "0.75rem" }}>
                        <strong>{day.dayOfWeek ? formatDay(day.dayOfWeek) : `Day ${day.dayNumber}`}</strong>
                        <ul>
                            {day.planExercises.items.length === 0 ? (
                                <li>No exercises for this day</li>
                            ) : (
                                day.planExercises.items.map((ex) => (
                                    <li key={ex.id}>
                                        Order: {ex.order}, Reps: {ex.suggestedReps ?? "-"}, Weight: {ex.suggestedWeight ?? "-"}
                                    </li>
                                ))
                            )}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserPlanView;
