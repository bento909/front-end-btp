// components/UserPlan/PlanEditor.tsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store.tsx";
import { dataClient } from "../../../../graphql/dataClient.ts";
import {
    fetchPlanExercisesThunk,
    exerciseAdded,
    exerciseUpdated,
    exerciseRemoved,
    exercisesReordered,
} from "../../../../redux/planExercisesSlice.tsx";
import { fetchExercisesThunk } from "../../../../redux/exercisesSlice.tsx";
import type { Plan } from "../../../../redux/plansSlice.tsx";
import PlanDayItem from "./PlanDayItem.tsx";

const WEEK_DAYS = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
] as const;

interface Props {
    plan: Plan;
    userName: string;
    onRefreshPlan: () => void;
    expandedDays: Set<string>;
    setExpandedDays: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const PlanEditor: React.FC<Props> = ({ plan, userName, expandedDays, setExpandedDays }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { days } = useSelector((state: RootState) => state.planDays);
    const { byDayId } = useSelector((state: RootState) => state.planExercises);
    const { exercises } = useSelector((state: RootState) => state.exercises);

    // Fetched once here, at the plan level — not per day-item. A plan can
    // render up to 7 PlanDayItem instances simultaneously; each one used to
    // fire its own fetchExercisesThunk() independently on mount, producing
    // up to 7 duplicate listExercises calls the moment a plan first loads.
    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchExercisesThunk());
        }
    }, [exercises.length, dispatch]);

    const onToggle = (id: string) =>
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const usesDayOfWeek = days.every((d) => Boolean(d.dayOfWeek));
    const sortedDays = [...days].sort((a, b) =>
        usesDayOfWeek
            ? WEEK_DAYS.indexOf(a.dayOfWeek as (typeof WEEK_DAYS)[number]) - WEEK_DAYS.indexOf(b.dayOfWeek as (typeof WEEK_DAYS)[number])
            : (a.dayNumber ?? 0) - (b.dayNumber ?? 0)
    );

    const handleDeleteExercise = async (id: string, dayId: string) => {
        // Optimistic — roll back by refetching just this day if the delete fails.
        dispatch(exerciseRemoved({ planDayId: dayId, id }));
        try {
            const res = await dataClient.models.PlanExercise.delete({ id });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
        } catch (error) {
            console.error("Failed to delete exercise:", error);
            dispatch(fetchPlanExercisesThunk(dayId));
        }
    };

    const handleEditExercises = async (
        dayId: string,
        exerciseId: string,
        updates: {
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number;
            order?: number;
        }
    ) => {
        try {
            const res = await dataClient.models.PlanExercise.update({ id: exerciseId, ...updates });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            if (res.data) dispatch(exerciseUpdated(res.data));
        } catch (error) {
            console.error("Failed to update exercise:", error);
            dispatch(fetchPlanExercisesThunk(dayId));
        }
    };

    const handleAddExercise = async (
        dayId: string,
        exerciseId: string,
        order: number,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => {
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.add(dayId);
            return next;
        });
        try {
            const res = await dataClient.models.PlanExercise.create({
                planId: plan.id!,
                planDayId: dayId,
                exerciseId,
                order,
                suggestedReps,
                suggestedWeight,
                suggestedSets,
                organizationId: plan.organizationId,
                staffGroup: plan.staffGroup,
            });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            if (res.data) dispatch(exerciseAdded(res.data));
        } catch (error) {
            console.error("Failed to add exercise:", error);
            dispatch(fetchPlanExercisesThunk(dayId));
        }
    };

    const handleReorderExercises = async (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number;
        }[]
    ) => {
        const current = byDayId[dayId] ?? [];
        const updatedList = current
            .map((exercise) => {
                const updated = reorderedItems.find((i) => i.id === exercise.id);
                return updated ? { ...exercise, order: updated.order } : exercise;
            })
            .sort((a, b) => a.order - b.order);
        dispatch(exercisesReordered({ planDayId: dayId, exercises: updatedList }));
        try {
            const results = await Promise.all(
                reorderedItems.map((item) => dataClient.models.PlanExercise.update({ id: item.id, order: item.order }))
            );
            if (results.some((r) => r.errors?.length)) throw new Error("One or more exercise order updates failed");
        } catch (error) {
            console.error("Error updating exercise order", error);
            dispatch(fetchPlanExercisesThunk(dayId));
        }
    };

    return (
        <div>
            <h4>{plan.name || `${userName}'s Plan`}</h4>
            <ul>
                {sortedDays.map((day) => (
                    <PlanDayItem
                        key={day.id}
                        day={day}
                        usesDayOfWeek={usesDayOfWeek}
                        expanded={expandedDays.has(day.id!)}
                        onToggle={() => onToggle(day.id!)}
                        onAddExercise={handleAddExercise}
                        onDeleteExercise={handleDeleteExercise}
                        onReorderExercises={handleReorderExercises}
                        onEditExercises={handleEditExercises}
                    />
                ))}
            </ul>
        </div>
    );
};

export default PlanEditor;
