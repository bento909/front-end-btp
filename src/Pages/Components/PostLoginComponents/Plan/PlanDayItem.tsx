import React from "react";
import {ListPlansQuery} from "../../../../graphql/types.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../../redux/store.tsx";
import {fetchExercisesThunk} from "../../../../redux/exercisesSlice.tsx";

import ExerciseListDraggable from "./PlanExerciseListDraggable.tsx";
import AddExerciseForm from "./AddExerciseForm.tsx";

interface Props {
    day: NonNullable<ListPlansQuery["listPlans"]["items"][0]>["planDays"]["items"][0];
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
    const dispatch = useDispatch<AppDispatch>();

    if (exercises.length === 0) {
        dispatch(fetchExercisesThunk());
    }

    const handleAddExercise = (
        exerciseId: string,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => {
        const nextOrder = day.planExercises.items.length + 1;
        onAddExercise(day.id, exerciseId, nextOrder, suggestedReps, suggestedWeight, suggestedSets);
    };

    return (
        <li>
            <button onClick={onToggle}>
                {usesDayOfWeek ? formatDayName(day.dayOfWeek!) : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <>
                    <ExerciseListDraggable
                        dayId={day.id}
                        exercises={day.planExercises.items}
                        allExercises={exercises}
                        onDeleteExercise={onDeleteExercise}
                        onReorderExercises={onReorderExercises}
                        onEditExercises={onEditExercises}
                    />
                    <AddExerciseForm onAddExercise={handleAddExercise} exercises={exercises}/>
                </>
            )}
        </li>
    );
};

export default PlanDayItem;
