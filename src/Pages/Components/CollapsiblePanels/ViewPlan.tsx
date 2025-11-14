import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchPlanByClientEmailThunk } from "../../../redux/plansSlice";
import { fetchExercisesThunk } from "../../../redux/exercisesSlice";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel";
import ExerciseInput from "../Plan/ExerciseInput.tsx";
// canonical ordered tuple for days of week
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
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const { plan, loading: planLoading, error: planError } = useSelector(
        (state: RootState) => state.plans
    );
    const {
        exercises,
        loading: exercisesLoading,
        error: exercisesError,
    } = useSelector((state: RootState) => state.exercises);

    // figure out today's day string
    const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as DayOfWeek;

    const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(today);
    const [exerciseInputs, setExerciseInputs] = useState<Record<string, any>>({});

    // fetch plan for user
    useEffect(() => {
        const userEmail = user?.emailAddress;
        if (userEmail) {
            dispatch(fetchPlanByClientEmailThunk(userEmail));
        }
    }, [dispatch, user?.emailAddress]);

    // fetch exercises if not loaded
    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchExercisesThunk());
        }
    }, [dispatch, exercises.length]);

    if (planLoading || exercisesLoading) return <p>Loading plan…</p>;
    if (planError) return <p style={{ color: "red" }}>{planError}</p>;
    if (exercisesError) return <p style={{ color: "red" }}>{exercisesError}</p>;
    if (!plan) return <p>No plan found.</p>;

    // map exerciseId → exerciseName
    const exerciseNameMap = Object.fromEntries(
        exercises.map((ex) => [ex.id, ex.name])
    );

    const handleExerciseChange = (exerciseId: string, data: any) => {
        setExerciseInputs((prev) => ({
            ...prev,
            [exerciseId]: data,
        }));
    };
    
    return (
        <div>
            <h3>{plan.name}</h3>
            {DaysOfWeek.map((dayName) => {
                const planDay = plan.planDays.items.find((d) => d.dayOfWeek === dayName);

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
                            <div>
                                {planDay.planExercises.items.map((ex) => (
                                    <ExerciseInput
                                        key={ex.id}
                                        planExercise={{
                                            id: ex.id,
                                            exerciseName: exerciseNameMap[ex.exerciseId] ?? `Exercise ${ex.exerciseId}`,
                                            suggestedSets: ex.suggestedSets?? 1,
                                            suggestedReps: ex.suggestedReps?? 1,
                                            suggestedWeight: ex.suggestedWeight?? 1
                                        }}
                                        savedData={exerciseInputs[ex.id]}
                                        onChange={(data) => handleExerciseChange(ex.id, data)}
                                    />
                                ))}
                            </div>
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
