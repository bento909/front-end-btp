// components/UserPlan/PlanEditor.tsx

import { useState } from "react";
import { CreatePlanExerciseInput, DayOfWeek, ListPlansQuery} from "../../graphql/types";
import PlanDayItem from "./PlanDayItem";
import { client } from "../../graphql/graphqlClient.ts";
import { createPlanExercise } from "../../graphql/mutations";  // <-- Import your mutation

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

interface Props {
    plan: ListPlansQuery["listPlans"]["items"][0];
    userName: string;
    // Add a prop to refresh the plan data from parent or use other state management
    onRefreshPlan: () => Promise<void>;
}

const PlanEditor: React.FC<Props> = ({ plan, userName, onRefreshPlan }) => {
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const onToggle = (id: string) =>
        setExpandedDays((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const usesDayOfWeek = plan.planDays.items.every((d) => Boolean(d.dayOfWeek));
    const sortedDays = [...plan.planDays.items].sort((a, b) =>
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
            exerciseId,
            order,
            suggestedReps,
            suggestedWeight
        };
        console.log('Creating exercise with input ' + input)
        try {
            await client.graphql({
                query: createPlanExercise, // Your mutation document imported
                variables: {
                    input
                },
            });
            await onRefreshPlan(); // Refresh plan data after mutation (pass from parent)
        } catch (error) {
            console.error("Failed to add exercise:", error);
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
                    />
                ))}
            </ul>
        </div>
    );
};

export default PlanEditor;
