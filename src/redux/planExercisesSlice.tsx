import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dataClient } from "../graphql/dataClient.ts";
import type { Schema } from "../../amplify/data/resource";

export type PlanExercise = Schema["PlanExercise"]["type"];

// The genuinely lazy layer: exercises for a day are only fetched when that
// day is expanded in the UI (PlanDayItem), not up front with the plan/days.
// A trainer's plan could have many days each with many exercises — fetching
// all of it eagerly on plan load is the thing BTP-7 exists to avoid.
interface PlanExercisesState {
    byDayId: Record<string, PlanExercise[]>;
    loadingDayIds: Record<string, boolean>;
    loadedDayIds: Record<string, boolean>;
    error: string | null;
}

const initialState: PlanExercisesState = {
    byDayId: {},
    loadingDayIds: {},
    loadedDayIds: {},
    error: null,
};

export const fetchPlanExercisesThunk = createAsyncThunk<
    { planDayId: string; exercises: PlanExercise[] },
    string,
    { rejectValue: string }
>(
    "planExercises/fetchByPlanDayId",
    async (planDayId, { rejectWithValue }) => {
        try {
            const res = await dataClient.models.PlanExercise.list({ filter: { planDayId: { eq: planDayId } } });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return { planDayId, exercises: res.data };
        } catch (err) {
            console.error(err);
            return rejectWithValue("Failed to fetch exercises");
        }
    }
);

const planExercisesSlice = createSlice({
    name: "planExercises",
    initialState,
    reducers: {
        reset: () => initialState,
        exerciseAdded: (state, action: PayloadAction<PlanExercise>) => {
            const dayId = action.payload.planDayId!;
            (state.byDayId[dayId] ??= []).push(action.payload);
        },
        exerciseUpdated: (state, action: PayloadAction<PlanExercise>) => {
            const dayId = action.payload.planDayId!;
            const list = state.byDayId[dayId];
            if (!list) return;
            const idx = list.findIndex((e) => e.id === action.payload.id);
            if (idx !== -1) list[idx] = action.payload;
        },
        exerciseRemoved: (state, action: PayloadAction<{ planDayId: string; id: string }>) => {
            const list = state.byDayId[action.payload.planDayId];
            if (!list) return;
            state.byDayId[action.payload.planDayId] = list.filter((e) => e.id !== action.payload.id);
        },
        exercisesReordered: (state, action: PayloadAction<{ planDayId: string; exercises: PlanExercise[] }>) => {
            state.byDayId[action.payload.planDayId] = action.payload.exercises;
        },
        dayExercisesCleared: (state, action: PayloadAction<string>) => {
            delete state.byDayId[action.payload];
            delete state.loadedDayIds[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlanExercisesThunk.pending, (state, action) => {
                state.loadingDayIds[action.meta.arg] = true;
                state.error = null;
            })
            .addCase(fetchPlanExercisesThunk.fulfilled, (state, action) => {
                state.loadingDayIds[action.payload.planDayId] = false;
                state.loadedDayIds[action.payload.planDayId] = true;
                state.byDayId[action.payload.planDayId] = action.payload.exercises;
            })
            .addCase(fetchPlanExercisesThunk.rejected, (state, action) => {
                state.loadingDayIds[action.meta.arg] = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset, exerciseAdded, exerciseUpdated, exerciseRemoved, exercisesReordered, dayExercisesCleared } = planExercisesSlice.actions;
export default planExercisesSlice.reducer;
