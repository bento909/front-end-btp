import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchPlanByClientEmailThunk } from "../../../redux/plansSlice";

const ViewPlan: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { plan, loading, error } = useSelector((state: RootState) => state.plans);

    useEffect(() => {
        const userEmail = user?.emailAddress;
        if (userEmail) {
            dispatch(fetchPlanByClientEmailThunk(userEmail));
        }
    }, [dispatch]);

    if (loading) return <p>Loading plan…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!plan) return <p>No plan found.</p>;

    return (
        <div>
            <h3>{plan.name}</h3>
            {plan.planDays.items.map((day) => (
                <div key={day.id} style={{ marginBottom: "1rem" }}>
                    <strong>{day.dayOfWeek ?? `Day ${day.dayNumber}`}</strong>
                    <ul>
                        {day.planExercises.items.map((ex) => (
                            <li key={ex.id}>
                                Exercise ID: {ex.exerciseId} | Reps: {ex.suggestedReps ?? "-"} | Weight: {ex.suggestedWeight ?? "-"}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ViewPlan;