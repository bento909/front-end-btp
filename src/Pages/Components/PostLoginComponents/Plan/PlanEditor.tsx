// components/UserPlan/PlanEditor.tsx

import {DayOfWeek, ListPlansQuery} from "../../../../graphql/types.ts";
import PlanDayItem from "./PlanDayItem.tsx";
import {client} from "../../../../graphql/graphqlClient.ts";
import {GraphQLResult} from "@aws-amplify/api-graphql";

import {
    CreatePlanExerciseInput,
    CreatePlanExerciseMutation,
    PlanExerciseDeletionInput,
    UpdatePlanExerciseOrderMutation
} from "../../../../graphql/PlanExercise/planExerciseTypes.ts";
import {createPlanExercise, deletePlanExercise, updatePlanExercise} from "../../../../graphql/PlanExercise/planExerciseMutations.ts";
import {useState} from "react"; // <-- Import your mutation

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

interface Props {
    plan: ListPlansQuery["listPlans"]["items"][0];
    userName: string;
    onRefreshPlan: () => void;
    expandedDays: Set<string>;
    setExpandedDays: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const PlanEditor: React.FC<Props> = ({plan, userName, onRefreshPlan, expandedDays, setExpandedDays}) => {
    const [planDays, setPlanDays] = useState(() =>
        plan.planDays.items.map(day => ({
            ...day,
            planExercises: {
                items: [...day.planExercises.items].sort((a, b) => a.order - b.order),
            },
        }))
    );
    const onToggle = (id: string) =>
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const usesDayOfWeek = plan.planDays.items.every((d) => Boolean(d.dayOfWeek));
    const sortedDays = [...planDays].sort((a, b) =>
        usesDayOfWeek
            ? WEEK_DAYS.indexOf(a.dayOfWeek!) - WEEK_DAYS.indexOf(b.dayOfWeek!)
            : a.dayNumber - b.dayNumber
    );

    const handleDeleteExercise = async (
        id: string,
        dayId: string
    ) => {
        setPlanDays((currentDays) =>
            currentDays.map((day) => {
                if (day.id !== dayId) return day;

                return {
                    ...day,
                    planExercises: {
                        items: day.planExercises.items.filter((ex) => ex.id !== id),
                    },
                };
            })
        );
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.add(dayId);
            return next;
        });
        const input: PlanExerciseDeletionInput = {
            id: id
        };
        console.log('deleting planExercise with id ', input)
        try {
            await client.graphql({
                query: deletePlanExercise,
                variables: {input}
            }) as GraphQLResult<PlanExerciseDeletionInput>
        } catch (error) {
            console.error("Failed to delete exercise:", error);
            onRefreshPlan();
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
        }) => {
        // 1. Optimistically update local state
        setPlanDays(currentDays =>
            currentDays.map(day =>
                day.id === dayId
                    ? {
                        ...day,
                        planExercises: {
                            items: day.planExercises.items.map(ex =>
                                ex.id === exerciseId ? { ...ex, ...updates } : ex
                            ),
                        },
                    }
                    : day
            )
        );

        // 2. Send update to backend
        try {
            await client.graphql({
                query: updatePlanExercise,
                variables: { input: { id: exerciseId, ...updates } },
            }) as GraphQLResult<UpdatePlanExerciseOrderMutation>;

            console.log(`✅ Updated exercise ${exerciseId}`);
        } catch (error) {
            console.error("❌ Failed to update exercise:", error);
            await onRefreshPlan(); // rollback with fresh data
        }
    };

    // The handler to add an exercise to a plan day
    const handleAddExercise = async (
        dayId: string,
        exerciseId: string,
        order: number,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => {
        const newExercise = {
            id: `temp-${Math.random()}`, // temporary ID until backend returns real ID
            exerciseId,
            order,
            suggestedReps,
            suggestedWeight,
            suggestedSets
        };

        setPlanDays(currentDays =>
            currentDays.map(day =>
                day.id === dayId
                    ? {
                        ...day,
                        planExercises: {items: [...day.planExercises.items, newExercise]}
                    }
                    : day
            )
        );
        // Re-expand the modified day
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.add(dayId);  // <- Ensure it stays open
            return next;
        });

        const input: CreatePlanExerciseInput = {
            planDayId: dayId,
            planId: plan.id,
            exerciseId,
            order,
            suggestedReps,
            suggestedWeight,
            suggestedSets
        };
        console.log('Creating exercise with input ', input);
        try {
            const result = await client.graphql({
                query: createPlanExercise,
                variables: {input},
            }) as GraphQLResult<CreatePlanExerciseMutation>;

            const realId = result.data?.createPlanExercise?.id;
            if (realId) {
                // 3. Replace temporary ID with real ID from backend
                setPlanDays(currentDays =>
                    currentDays.map(day =>
                        day.id === dayId
                            ? {
                                ...day,
                                planExercises: {
                                    items: day.planExercises.items.map(ex =>
                                        ex.id.startsWith("temp-") ? {...ex, id: realId} : ex
                                    ),
                                },
                            }
                            : day
                    )
                );
            }
        } catch (error) {
            console.error("Failed to add exercise:", error);
            setPlanDays(currentDays =>
                currentDays.map(day =>
                    day.id === dayId
                        ? {
                            ...day,
                            planExercises: {
                                items: day.planExercises.items.filter(ex => !ex.id.startsWith("temp-")),
                            },
                        }
                        : day
                )
            );
            await onRefreshPlan();
        }
    };

    const handleReorderExercises = async (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number
        }[]
    ) => {
        setPlanDays(currentDays =>
            currentDays.map(day => {
                if (day.id !== dayId) return day;
                return {
                    ...day,
                    planExercises: {
                        items: day.planExercises.items
                            .map(exercise => {
                                const updated = reorderedItems.find(i => i.id === exercise.id);
                                return updated ? {...exercise, order: updated.order} : exercise;
                            })
                            .sort((a, b) => a.order - b.order),
                    },
                };
            })
        );
        try {
            await Promise.all(
                reorderedItems.map((item) =>
                    client.graphql({
                        query: updatePlanExercise,
                        variables: {input: {id: item.id, order: item.order}},
                    }) as Promise<GraphQLResult<UpdatePlanExerciseOrderMutation>>
                )
            );
            console.log(`✅ Exercise order updated for day ${dayId}`);
        } catch (error) {
            console.error("❌ Error updating exercise order", error);
            await onRefreshPlan()
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
                        expanded={expandedDays.has(day.id)}
                        onToggle={() => onToggle(day.id)}
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
