import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../graphql/graphqlClient";
import {createExerciseLogMutation, updateExerciseLogMutation} from "../graphql/ExerciseLog/exerciseLogMutations"; // ✅ correct import
import { GraphQLResult } from "@aws-amplify/api-graphql";
import {
    CreateExerciseLogInput,
    ExerciseLog,
    ExerciseLogMutationResult, ExerciseLogQueryResult
} from "../graphql/ExerciseLog/exerciseLogTypes.ts";
import { getExerciseLogQuery} from "../graphql/ExerciseLog/exerciseLogQueries.ts";

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

export const submitExerciseLogThunk = createAsyncThunk(
    "exerciseLogs/submit",
    async (input: CreateExerciseLogInput, thunkAPI) => {
        try {
            const result = (await client.graphql({
                query: createExerciseLogMutation,
                variables: { input },
            })) as GraphQLResult<ExerciseLogMutationResult>;

            return result.data?.createExerciseLog;
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
            const result = (await client.graphql({
                query: getExerciseLogQuery,
                variables: { id },
            })) as GraphQLResult<ExerciseLogQueryResult>;

            return result.data?.getExerciseLog;
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
            const result = (await client.graphql({
                query: updateExerciseLogMutation,
                variables: { input },
            })) as GraphQLResult<any>;
            return result.data?.updateExerciseLog;
        } catch (err) {
            console.error("Failed to update exercise log", err);
            return thunkAPI.rejectWithValue("Failed to update exercise log");
        }
    }
);
//
// export const fetchExerciseLogByPlanExerciseIdThunk = createAsyncThunk(
//     "exerciseLogs/fetchByPlanExerciseId",
//     async (planExerciseId: string, thunkAPI) => {
//         try {
//             const result = (await client.graphql({
//                 query: getExerciseLogByPlanExerciseIdQuery,
//                 variables: { planExerciseId },
//             })) as GraphQLResult<any>;
//             return result.data?.getExerciseLogByPlanExerciseId;
//         } catch (err) {
//             console.error("Failed to fetch log", err);
//             return thunkAPI.rejectWithValue("Failed to fetch log");
//         }
//     }
// );

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
            });
    },
});

export default exerciseLogsSlice.reducer;
