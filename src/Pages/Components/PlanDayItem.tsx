// components/UserPlan/PlanDayItem.tsx
// This component renders each individual day of a plan, including:
//
// Expand/collapse toggle
//
// Day name (or number)
//
// Listing of exercises (basic for now — can be extended later to support editing)
//
// You can also add editing for day name/notes in here later if needed
import { ListPlansQuery } from "../../graphql/types";

interface Props {
    day: NonNullable<ListPlansQuery["listPlans"]["items"][0]>["planDays"]["items"][0];
    usesDayOfWeek: boolean;
    expanded: boolean;
    onToggle: () => void;
}

const formatDayName = (dayOfWeek: string): string =>
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

const PlanDayItem: React.FC<Props> = ({ day, usesDayOfWeek, expanded, onToggle }) => {
    return (
        <li style={{ marginBottom: 12 }}>
            <button onClick={onToggle}>
                {usesDayOfWeek ? formatDayName(day.dayOfWeek!) : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <ul style={{ marginLeft: 16 }}>
                    {day.planExercises.items.length === 0 ? (
                        <li>No exercises</li>
                    ) : (
                        day.planExercises.items.map(ex => (
                            <li key={ex.id}>
                                Order {ex.order}, Reps {ex.suggestedReps}, Weight {ex.suggestedWeight}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </li>
    );
};

export default PlanDayItem;
