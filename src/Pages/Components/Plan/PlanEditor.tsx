// components/UserPlan/PlanEditor.tsx

import {CreatePlanExerciseInput, DayOfWeek, ListPlansQuery} from "../../../graphql/types.ts";
import PlanDayItem from "./PlanDayItem.tsx";
import { client } from "../../../graphql/graphqlClient.ts";
import {GraphQLResult} from "@aws-amplify/api-graphql";
import {updatePlanExercise} from "../../../graphql/PlanDay/planDayMutations.ts";
import {
    CreatePlanExerciseMutation,
    UpdatePlanExerciseOrderMutation
} from "../../../graphql/PlanExercise/planExerciseTypes.ts";
import {createPlanExercise} from "../../../graphql/PlanExercise/planExerciseMutations.ts";
import {useState} from "react";  // <-- Import your mutation

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

interface Props {
    plan: ListPlansQuery["listPlans"]["items"][0];
    userName: string;
    onRefreshPlan: () => Promise<void>;
    expandedDays: Set<string>;
    setExpandedDays: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const PlanEditor: React.FC<Props> = ({ plan, userName, onRefreshPlan, expandedDays, setExpandedDays }) => {
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

    // The handler to add an exercise to a plan day
    const handleAddExercise =  async (
        dayId: string,
        exerciseId: string,
        order: number,
        suggestedReps: number,
        suggestedWeight: number
    ) => {
        const input: CreatePlanExerciseInput = {
            planDayId: dayId,
            planId: plan.id,
            exerciseId,
            order,
            suggestedReps,
            suggestedWeight
        };
        console.log('Creating exercise with input', input);
        try {
            await client.graphql({
                query: createPlanExercise,
                variables: { input },
            }) as GraphQLResult<CreatePlanExerciseMutation>;

            // Re-expand the modified day
            setExpandedDays((prev) => {
                const next = new Set(prev);
                next.add(dayId);  // <- Ensure it stays open
                return next;
            });

            await onRefreshPlan(); // Now reload data, but expandedDays still includes dayId

        } catch (error) {
            console.error("Failed to add exercise:", error);
        }
    };

    const handleReorderExercises = async (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
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
                                return updated ? { ...exercise, order: updated.order } : exercise;
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
                        variables: { input: { id: item.id, order: item.order } },
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
                        onAddExercise={handleAddExercise} // Pass handler here
                        onReorderExercises={handleReorderExercises}
                    />
                ))}
            </ul>
        </div>
    );
};

export default PlanEditor;
