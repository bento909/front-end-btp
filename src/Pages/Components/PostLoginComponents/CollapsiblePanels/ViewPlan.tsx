import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../../redux/store.tsx";
import { fetchPlanByClientEmailThunk } from "../../../../redux/plansSlice.tsx";
import { fetchPlanDaysThunk } from "../../../../redux/planDaysSlice.tsx";
import { fetchPlanExercisesThunk } from "../../../../redux/planExercisesSlice.tsx";
import { fetchExercisesThunk } from "../../../../redux/exercisesSlice.tsx";
import CollapsiblePanel from "../../../../Styles/CollapsiblePanel.tsx";
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
    const { days, loading: daysLoading } = useSelector((state: RootState) => state.planDays);
    const { byDayId, loadingDayIds, loadedDayIds } = useSelector((state: RootState) => state.planExercises);
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

    const canView = !!user?.permissions?.viewMyPlan;

    // fetch plan for user
    useEffect(() => {
        const userEmail = user?.emailAddress;
        if (canView && userEmail) {
            dispatch(fetchPlanByClientEmailThunk(userEmail));
        }
    }, [dispatch, canView, user?.emailAddress]);

    // fetch this plan's days once the plan itself has loaded
    useEffect(() => {
        if (canView && plan) {
            dispatch(fetchPlanDaysThunk(plan.id!));
        }
    }, [dispatch, canView, plan?.id]);

    // fetch exercises if not loaded
    useEffect(() => {
        if (canView && exercises.length === 0) {
            dispatch(fetchExercisesThunk());
        }
    }, [dispatch, canView, exercises.length]);

    // lazy-load: only the currently expanded day's exercises are fetched —
    // matches the collapsible-panel-per-day UI, which only ever shows one
    // day's exercises at a time anyway.
    const expandedPlanDay = expandedDay ? days.find((d) => d.dayOfWeek === expandedDay) : undefined;
    const expandedPlanDayId = expandedPlanDay?.id;
    useEffect(() => {
        if (expandedPlanDayId && !loadedDayIds[expandedPlanDayId] && !loadingDayIds[expandedPlanDayId]) {
            dispatch(fetchPlanExercisesThunk(expandedPlanDayId));
        }
    }, [expandedPlanDayId, loadedDayIds, loadingDayIds, dispatch]);

    if (!canView) return null;
    if (planLoading || daysLoading || exercisesLoading) return <p>Loading plan…</p>;
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
                const planDay = days.find((d) => d.dayOfWeek === dayName);
                const dayExercises = planDay ? byDayId[planDay.id!] ?? [] : [];
                const dayLoading = planDay ? loadingDayIds[planDay.id!] : false;
                const dayLoaded = planDay ? loadedDayIds[planDay.id!] : false;

                return (
                    <CollapsiblePanel
                        key={dayName}
                        title={dayName.charAt(0) + dayName.slice(1).toLowerCase()}
                        isOpen={expandedDay === dayName}
                        toggle={() =>
                            setExpandedDay(expandedDay === dayName ? null : dayName)
                        }
                    >
                        {!planDay ? (
                            <p>No exercises for this day.</p>
                        ) : dayLoading && !dayLoaded ? (
                            <p>Loading exercises…</p>
                        ) : dayExercises.length === 0 ? (
                            <p>No exercises for this day.</p>
                        ) : (
                            <div>
                                {[...dayExercises]
                                    .sort((a, b) => a.order - b.order)
                                    .map((ex) => (
                                    <ExerciseInput
                                        key={ex.id}
                                        planExercise={{
                                            id: ex.id!,
                                            exerciseName: exerciseNameMap[ex.exerciseId] ?? `Exercise ${ex.exerciseId}`,
                                            suggestedSets: ex.suggestedSets?? 1,
                                            suggestedReps: ex.suggestedReps?? 1,
                                            suggestedWeight: ex.suggestedWeight?? 1
                                        }}
                                        savedData={exerciseInputs[ex.id!]}
                                        onChange={(data) => handleExerciseChange(ex.id!, data)}
                                    />
                                ))}
                            </div>
                        )}
                    </CollapsiblePanel>
                );
            })}
        </div>
    );
};

export default ViewPlan;
