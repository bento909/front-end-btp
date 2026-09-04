import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { PlanDay } from "../../../../redux/planDaysSlice.tsx";
import { fetchPlanExercisesThunk } from "../../../../redux/planExercisesSlice.tsx";
import { AppDispatch, RootState } from "../../../../redux/store.tsx";
import { ExerciseTypeEnum } from "../../../../graphql/types.ts";

import ExerciseListDraggable from "./PlanExerciseListDraggable.tsx";
import AddExerciseForm from "./AddExerciseForm.tsx";

interface Props {
    day: PlanDay;
    usesDayOfWeek: boolean;
    expanded: boolean;
    onToggle: () => void;
    onAddExercise: (
        dayId: string,
        exerciseId: string,
        order: number,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => void;
    onDeleteExercise: (
        exerciseId: string,
        dayId: string,
    ) => void;
    onReorderExercises: (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number
        }[]
    ) => void;
    onEditExercises: (
        dayId: string,
        exerciseId: string,
        updates: {
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number
            order?: number;
        }
    ) => void;
}

const formatDayName = (dayOfWeek: string): string =>
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

const PlanDayItem: React.FC<Props> = ({
                                          day,
                                          usesDayOfWeek,
                                          expanded,
                                          onToggle,
                                          onAddExercise,
                                          onDeleteExercise,
                                          onReorderExercises,
                                          onEditExercises
                                      }) => {
    const {exercises} = useSelector((state: RootState) => state.exercises);
    const dayExercises = useSelector((state: RootState) => state.planExercises.byDayId[day.id!]) ?? [];
    const loaded = useSelector((state: RootState) => state.planExercises.loadedDayIds[day.id!]);
    const loading = useSelector((state: RootState) => state.planExercises.loadingDayIds[day.id!]);
    const dispatch = useDispatch<AppDispatch>();

    // The lazy-load point (BTP-7): a day's exercises are only ever fetched
    // once that day is actually expanded, not up front with the plan/days —
    // a plan can have many days each with many exercises, and there's no
    // reason to pull all of it just to render the collapsed day list.
    useEffect(() => {
        if (expanded && !loaded && !loading) {
            dispatch(fetchPlanExercisesThunk(day.id!));
        }
    }, [expanded, loaded, loading, day.id, dispatch]);

    // Amplify's generated Exercise type marks id/name/type as nullable
    // (conservative client typing); every persisted record actually has
    // them, so normalize once here rather than optional-chaining at every
    // call site below.
    const normalizedExercises = exercises.map((ex) => ({
        id: ex.id ?? "",
        name: ex.name ?? "",
        type: ex.type as ExerciseTypeEnum,
    }));

    const draggableExercises = [...dayExercises]
        .sort((a, b) => a.order - b.order)
        .map((ex) => ({
            id: ex.id!,
            order: ex.order,
            suggestedReps: ex.suggestedReps ?? undefined,
            suggestedWeight: ex.suggestedWeight ?? undefined,
            suggestedSets: ex.suggestedSets ?? undefined,
            exerciseId: ex.exerciseId,
        }));

    const handleAddExercise = (
        exerciseId: string,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => {
        const nextOrder = dayExercises.length + 1;
        onAddExercise(day.id!, exerciseId, nextOrder, suggestedReps, suggestedWeight, suggestedSets);
    };

    return (
        <li>
            <button onClick={onToggle}>
                {usesDayOfWeek ? formatDayName(day.dayOfWeek!) : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <>
                    {loading && !loaded ? (
                        <p>Loading exercises…</p>
                    ) : (
                        <ExerciseListDraggable
                            dayId={day.id!}
                            exercises={draggableExercises}
                            allExercises={normalizedExercises}
                            onDeleteExercise={onDeleteExercise}
                            onReorderExercises={onReorderExercises}
                            onEditExercises={onEditExercises}
                        />
                    )}
                    <AddExerciseForm onAddExercise={handleAddExercise} exercises={normalizedExercises}/>
                </>
            )}
        </li>
    );
};

export default PlanDayItem;
