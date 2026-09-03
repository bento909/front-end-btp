import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dataClient } from "../graphql/dataClient.ts";
import type { Schema } from "../../amplify/data/resource";

type Exercise = Schema["Exercise"]["type"];

interface ExercisesState {
    exercises: Exercise[];
    loading: boolean;
    error: string | null;
}

const initialState: ExercisesState = {
    exercises: [],
    loading: false,
    error: null,
};

export const fetchExercisesThunk = createAsyncThunk(
    "exercises/fetchAll",
    async (_, thunkAPI) => {
        try {
            const res = await dataClient.models.Exercise.list();
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to fetch exercises");
        }
    }
);

const exercisesSlice = createSlice({
    name: "exercises",
    initialState,
    reducers: {
        clearExercises: (state) => {
            state.exercises = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExercisesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExercisesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.exercises = action.payload;
            })
            .addCase(fetchExercisesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearExercises } = exercisesSlice.actions;
export default exercisesSlice.reducer;
