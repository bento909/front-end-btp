export interface CreateExerciseLogInput {
    planExerciseId: string;
    date: string;
    sets: string;
    clientNotes?: string;
}

export interface ExerciseLog {
    id: string;
    planExerciseId: string;
    date: string;
    sets: string;
    clientNotes?: string;
}

export interface UpdateExerciseLogInput {
    id: string;
    sets?: string;
    clientNotes?: string;
}

export interface ExerciseLogQueryResult {
    getExerciseLog: ExerciseLog;
}

export interface ExerciseLogUpdateResult {
    updateExerciseLog: ExerciseLog;
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