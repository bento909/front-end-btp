import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {dataClient} from "../graphql/dataClient.ts";
import type {Schema} from "../../amplify/data/resource";

type ExerciseLog = Schema["ExerciseLog"]["type"];

interface ExerciseLogsState {
    loading: boolean;
    error: string | null;
    logsByExerciseId: Record<string, ExerciseLog | undefined>;
}

const initialState: ExerciseLogsState = {
    loading: false,
    error: null,
    logsByExerciseId: {},
};

interface CreateExerciseLogInput {
    planExerciseId: string;
    date: string;
    sets: string;
    clientNotes?: string;
    organizationId: string;
}

export const submitExerciseLogThunk = createAsyncThunk(
    "exerciseLogs/submit",
    async (input: CreateExerciseLogInput, thunkAPI) => {
        try {
            const result = await dataClient.models.ExerciseLog.create(input);
            if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join("; "));
            return result.data;
        } catch (err) {
            console.error("Failed to submit exercise log", err);
            return thunkAPI.rejectWithValue("Failed to submit exercise log");
        }
    }
);

export const getExerciseLogThunk = createAsyncThunk(
    "exerciseLogs/getOne",
    async (id: string, thunkAPI) => {
        try {
            const result = await dataClient.models.ExerciseLog.get({id});
            if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join("; "));
            return result.data;
        } catch (err) {
            console.error("Failed to fetch exercise log", err);
            return thunkAPI.rejectWithValue("Failed to fetch exercise log");
        }
    }
);

export const updateExerciseLogThunk = createAsyncThunk(
    "exerciseLogs/update",
    async (input: { id: string; sets: string }, thunkAPI) => {
        try {
            const result = await dataClient.models.ExerciseLog.update(input);
            if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join("; "));
            return result.data;
        } catch (err) {
            console.error("Failed to update exercise log", err);
            return thunkAPI.rejectWithValue("Failed to update exercise log");
        }
    }
);

export const fetchLatestExerciseLogByPlanExerciseIdThunk = createAsyncThunk(
    "exerciseLogs/fetchLatestByPlanExerciseId",
    async (planExerciseId: string, thunkAPI) => {
        try {
            // Filter-only list (a DynamoDB scan under the hood, same as the
            // hand-written query this replaces) has no guaranteed order —
            // sort client-side by date to actually get the latest, rather
            // than relying on an unenforced sortDirection like the old
            // hand-written query did.
            const result = await dataClient.models.ExerciseLog.list({
                filter: {planExerciseId: {eq: planExerciseId}},
            });
            if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join("; "));

            const items = [...result.data].sort((a, b) => b.date.localeCompare(a.date));
            return items[0] ?? null;
        } catch (err) {
            console.error("Failed to fetch latest log", err);
            return thunkAPI.rejectWithValue("Failed to fetch latest log");
        }
    }
);

const exerciseLogsSlice = createSlice({
    name: "exerciseLogs",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(submitExerciseLogThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitExerciseLogThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(submitExerciseLogThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getExerciseLogThunk.fulfilled, (state, action) => {
                const log = action.payload;
                if (log) state.logsByExerciseId[log.planExerciseId] = log;
            })
            .addCase(updateExerciseLogThunk.fulfilled, (state, action) => {
                const log = action.payload;
                if (log) state.logsByExerciseId[log.planExerciseId] = log;
            }).addCase(fetchLatestExerciseLogByPlanExerciseIdThunk.fulfilled, (state, action) => {
            const log = action.payload;
            if (log) state.logsByExerciseId[log.planExerciseId] = log;
        });
    },
});

export default exerciseLogsSlice.reducer;
