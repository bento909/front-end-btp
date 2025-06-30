// components/UserPlan/PlanEditor.tsx

import { useState } from "react";
import { DayOfWeek, ListPlansQuery } from "../../graphql/types";
import PlanDayItem from "./PlanDayItem";

const WEEK_DAYS: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];

interface Props {
    plan: ListPlansQuery["listPlans"]["items"][0];
    userName: string;
}

const PlanEditor: React.FC<Props> = ({ plan, userName }) => {
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const onToggle = (id: string) =>
        setExpandedDays(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const usesDayOfWeek = plan.planDays.items.every(d => Boolean(d.dayOfWeek));
    const sortedDays = [...plan.planDays.items].sort((a, b) =>
        usesDayOfWeek
            ? WEEK_DAYS.indexOf(a.dayOfWeek!) - WEEK_DAYS.indexOf(b.dayOfWeek!)
            : a.dayNumber - b.dayNumber
    );

    return (
        <div>
            <h4>{plan.name || `${userName}'s Plan`}</h4>
            <ul>
                {sortedDays.map(day => (
                    <PlanDayItem
                        key={day.id}
                        day={day}
                        usesDayOfWeek={usesDayOfWeek}
                        expanded={expandedDays.has(day.id)}
                        onToggle={() => onToggle(day.id)}
                    />
                ))}
            </ul>
        </div>
    );
};

export default PlanEditor;
