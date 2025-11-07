export interface CreateExerciseLogInput {
    planExerciseId: string;
    date: string;
    sets: string;
    clientNotes?: string;
}

export interface ExerciseLogMutationResult {
    createExerciseLog: {
        id: string;
        planExerciseId: string;
        date: string;
        sets: { reps: string; weight: string }[];
        clientNotes?: string;
    };
}