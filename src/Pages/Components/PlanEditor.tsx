// components/UserPlan/PlanEditor.tsx

import {CreatePlanExerciseInput, CreatePlanExerciseMutation, DayOfWeek, ListPlansQuery} from "../../graphql/types";
import PlanDayItem from "./PlanDayItem";
import { client } from "../../graphql/graphqlClient.ts";
import { createPlanExercise } from "../../graphql/mutations";
import {GraphQLResult} from "@aws-amplify/api-graphql";  // <-- Import your mutation

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
