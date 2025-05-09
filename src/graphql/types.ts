export type DayOfWeek =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export type ExerciseType = "LIFT" | "RUN" | "CYCLE" | "INTERVAL" | "KB_SWING";

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
                    dayOfWeek: DayOfWeek;
                    dayNumber: number;
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
        }>;
    };
}

export interface ListExercisesQuery {
    listExercises: {
        items: Array<{
            id: string;
            name: string;
            type: ExerciseType;
            tips?: string;
            notes?: string;
            planExercises: {
                items: Array<{
                    id: string;
                    planId: string;
                    order: number;
                    suggestedReps?: number;
                    suggestedWeight?: number;
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
            exercise: {
                id: string;
                name: string;
                type: ExerciseType;
            };
            planDay: {
                id: string;
                dayOfWeek: DayOfWeek;
                dayNumber: number;
            };
        }>;
    };
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
        type: ExerciseType;
        tips?: string;
        notes?: string;
        planExercises: {
            items: Array<{
                id: string;
                planId: string;
                order: number;
                suggestedReps?: number;
                suggestedWeight?: number;
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
        planDay: {
            id: string;
            dayOfWeek: DayOfWeek;
            dayNumber: number;
        };
        exercise: {
            id: string;
            name: string;
            type: ExerciseType;
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
    type: ExerciseType;
    tips?: string;
    notes?: string;
}

// --- the shape of the data you get back from the mutation ---
export interface CreateExerciseMutation {
    createExercise: {
        id: string;
        name: string;
        type: ExerciseType;
        tips?: string;
        notes?: string;
    };
}