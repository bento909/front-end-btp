import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../graphql/graphqlClient";
import { createExerciseLogMutation } from "../graphql/ExerciseLog/exerciseLogMutations"; // ✅ correct import
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { CreateExerciseLogInput, ExerciseLogMutationResult } from "../graphql/ExerciseLog/exerciseLogTypes.ts";

interface ExerciseLogsState {
    loading: boolean;
    error: string | null;
}

const initialState: ExerciseLogsState = {
    loading: false,
    error: null,
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
            });
    },
});

export default exerciseLogsSlice.reducer;
