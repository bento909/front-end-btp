export type DayOfWeek =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export enum ExerciseTypeEnum {
    LIFT = "LIFT",
    RUN = "RUN",
    CYCLE = "CYCLE",
    INTERVAL = "INTERVAL",
    KB_SWING = "KB_SWING",
}

// Define the type for each item
export interface ExerciseTypeInfo {
    type: ExerciseTypeEnum;
    label: string;
}

// Now use that type for the array
export const ExerciseTypeMetadata: ExerciseTypeInfo[] = [
    { type: ExerciseTypeEnum.LIFT, label: "Lift Weight" },
    { type: ExerciseTypeEnum.RUN, label: "Run" },
    { type: ExerciseTypeEnum.CYCLE, label: "Cycle" },
    { type: ExerciseTypeEnum.INTERVAL, label: "Interval Training" },
    { type: ExerciseTypeEnum.KB_SWING, label: "Kettlebells" },
];

export interface Plan {
    id: string;
    name: string;
    trainerEmail: string;
    clientEmail: string;
    planDays: {
        items: Array<{
            id: string;
            name?: string;
            notes?: string;
            dayOfWeek: DayOfWeek;
            dayNumber: number;
            planExercises: {
                items: Array<{
                    id: string;
                    exerciseId: string;
                    order: number;
                    suggestedReps?: number;
                    suggestedWeight?: number;
                    suggestedSets?: number;
                }>;
            };
        }>;
    };
}

export interface ListPlansQuery {
    listPlans: {
        items: Array<{
            id: string;
            name: string;
            trainerEmail: string;
            clientEmail: string;
            planDays: {
                items: Array<{
                    id: string;
                    name?: string;
                    notes?: string;
                    dayOfWeek: DayOfWeek;
                    dayNumber: number;
                    planExercises: {
                        items: Array<{
                            id: string;
                            exerciseId: string;
                            order: number;
                            suggestedReps?: number;
                            suggestedWeight?: number;
                            suggestedSets?: number;
                        }>;
                    };
                }>;
            };
        }>;
    };
}

export interface ListExercisesQuery {
    listExercises: {
        items: Array<{
            id: string;
            name: string;
            type: ExerciseTypeEnum;
            tips?: string;
            notes?: string;
            planExercises: {
                items: Array<{
                    id: string;
                    planId: string;
                    order: number;
                    suggestedReps?: number;
                    suggestedWeight?: number;
                    suggestedSets?: number;
                }>;
            };
        }>;
    };
}

export interface ListPlanExercisesQuery {
    listPlanExercises: {
        items: Array<{
            id: string;
            planId: string;
            exerciseId: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number;
            exercise: {
                id: string;
                name: string;
                type: ExerciseTypeEnum;
            };
            planDay: {
                id: string;
                dayOfWeek: DayOfWeek;
                dayNumber: number;
            };
        }>;
    };
}

export interface ListExerciseLogsQuery {
    listExerciseLogs: {
        items: Array<{
            id: string;
            planExerciseId: string;
            date: string;
            sets: any;
            clientNotes?: string;
            planExercise: {
                id: string;
                planId: string;
                exerciseId: string;
                order: number;
            };
        }>;
    };
}

export interface GetPlanByIdQuery {
    getPlan: {
        id: string;
        name: string;
        trainerEmail: string;
        clientEmail: string;
        planDays: {
            items: Array<{
                id: string;
                dayOfWeek: DayOfWeek;
                dayNumber: number;
                planExercises: {
                    items: Array<{
                        id: string;
                        order: number;
                        suggestedReps?: number;
                        suggestedWeight?: number;
                        suggestedSets?: number;
                    }>;
                };
            }>;
        };
    };
}

export interface GetExerciseByIdQuery {
    getExercise: {
        id: string;
        name: string;
        type: ExerciseTypeEnum;
        tips?: string;
        notes?: string;
        planExercises: {
            items: Array<{
                id: string;
                planId: string;
                order: number;
                suggestedReps?: number;
                suggestedWeight?: number;
                suggestedSets?: number;
            }>;
        };
    };
}

export interface GetPlanExerciseByIdQuery {
    getPlanExercise: {
        id: string;
        planId: string;
        exerciseId: string;
        order: number;
        suggestedReps?: number;
        suggestedWeight?: number;
        suggestedSets?: number;
        planDay: {
            id: string;
            dayOfWeek: DayOfWeek;
            dayNumber: number;
        };
        exercise: {
            id: string;
            name: string;
            type: ExerciseTypeEnum;
        };
    };
}

export interface GetPlanDayByIdQuery {
    getPlanDay: {
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
                suggestedSets?: number;
            }>;
        };
    };
}

export interface GetExerciseLogByIdQuery {
    getExerciseLog: {
        id: string;
        planExerciseId: string;
        date: string;
        sets: any;
        clientNotes?: string;
        planExercise: {
            id: string;
            planId: string;
            exerciseId: string;
            order: number;
        };
    };
}


// --- the GraphQL input type for createExercise ---
export interface CreateExerciseInput {
    name: string;
    type: ExerciseTypeEnum;
    tips?: string;
    notes?: string;
}

// --- the shape of the data you get back from the mutation ---
export interface CreateExerciseMutation {
    createExercise: {
        id: string;
        name: string;
        type: ExerciseTypeEnum;
        tips?: string;
        notes?: string;
    };
}

// --- INPUT TYPES ---

export interface CreatePlanInput {
    name: string;
    trainerEmail: string;
    clientEmail: string;
}

// --- MUTATION RESPONSE TYPES ---

export interface CreatePlanMutation {
    createPlan: {
        id: string;
        name: string;
        trainerEmail: string;
        clientEmail: string;
    };
}

export interface CreateExerciseMutation {
    createExercise: {
        id: string;
        name: string;
        type: ExerciseTypeEnum;
        tips?: string;
        notes?: string;
    };
}

// The response type
export interface CreatePlanDayMutation {
    createPlanDay: {
        id: string;
        planId: string;
        dayOfWeek?: DayOfWeek;
        dayNumber?: number;
    };
}