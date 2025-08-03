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

