import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchPlanByClientEmailThunk } from "../../../redux/plansSlice";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel"; // adjust path

// ✅ canonical ordered tuple for days of week
export const DaysOfWeek = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
] as const;

export type DayOfWeek = typeof DaysOfWeek[number];

const ViewPlan: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const { plan, loading, error } = useSelector((state: RootState) => state.plans);

    // figure out today's day string in uppercase
    const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as DayOfWeek;

    // track which day is expanded
    const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(today);

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
            {DaysOfWeek.map((dayName) => {
                const planDay = plan.planDays.items.find(
                    (d) => d.dayOfWeek === dayName
                );

                return (
                    <CollapsiblePanel
                        key={dayName}
                        title={dayName.charAt(0) + dayName.slice(1).toLowerCase()}
                        isOpen={expandedDay === dayName}
                        toggle={() =>
                            setExpandedDay(expandedDay === dayName ? null : dayName)
                        }
                    >
                        {planDay ? (
                            <ul>
                                {planDay.planExercises.items.map((ex) => (
                                    <li key={ex.id}>
                                        <strong>{`Exercise ${ex.exerciseId}`}</strong>{" "}
                                        — Reps: {ex.suggestedReps ?? "-"} | Weight:{" "}
                                        {ex.suggestedWeight ?? "-"}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No exercises for this day.</p>
                        )}
                    </CollapsiblePanel>
                );
            })}
        </div>
    );
};

export default ViewPlan;
