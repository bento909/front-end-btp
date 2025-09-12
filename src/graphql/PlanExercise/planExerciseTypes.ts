export interface CreatePlanExerciseMutation {
    createPlanExercise: {
        id: string;
        planId: string;
        exerciseId: string;
        order: number;
        suggestedReps?: number;
        suggestedWeight?: number;
        planDay: {
            id: string;
        };
    };
}

export interface UpdatePlanExerciseOrderMutation {
    updatePlanExercise: {
        id: string;
        order: number;
        suggestedReps?: number;
        suggestedWeight?: number;
        planDay: {
            id: string;
        };
    };
}

export interface CreatePlanExerciseInput {
    planDayId: string;
    planId: string;
    exerciseId: string;
    order?: number;
    suggestedReps?: number;
    suggestedWeight?: number;
}

export interface CreateExerciseLogInput {
    planExerciseId: string;
    date: string;             // ISO string of when the exercise was done
    sets: number;
    clientNotes?: string;
}

export interface PlanExerciseDeletionInput {
    id: string;
}

