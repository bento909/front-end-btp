import {DayOfWeek} from "../types.ts";


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