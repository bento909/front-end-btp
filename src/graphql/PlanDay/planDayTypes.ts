import {DayOfWeek} from "../types.ts";

// Input for creating a PlanDay
export interface CreatePlanDayInput {
    planId: string;
    name?: string;            // eg Leg Day or whatever
    notes?: string;           // describe what you want client to do today
    dayOfWeek?: DayOfWeek;    // optional—only for WEEK plans
    dayNumber?: number;       // optional—only for CUSTOM plans
}

export interface ListPlanDaysQuery {
    listPlanDays: {
        items: Array<{
            id: string;
            planId: string;
            dayOfWeek: DayOfWeek;
            dayNumber: number;
            plan: {
                id: string;
                name: string;
            };
            planExercises: {
                items: Array<{
                    id: string;
                    order: number;
                    suggestedReps?: number;
                    suggestedWeight?: number;
                }>;
            };
        }>;
    };
}