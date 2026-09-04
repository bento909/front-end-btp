import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dataClient } from "../graphql/dataClient.ts";
import type { Schema } from "../../amplify/data/resource";

export type PlanDay = Schema["PlanDay"]["type"];

// Flat, keyed by day id. Days for a plan are fetched once, up front, when the
// plan loads — a plan's day list is small and bounded (max 7), unlike its
// exercises (see planExercisesSlice), so there's no scale reason to lazy-load
// this level.
interface PlanDaysState {
    days: PlanDay[];
    loading: boolean;
    error: string | null;
}

const initialState: PlanDaysState = {
    days: [],
    loading: false,
    error: null,
};

export const fetchPlanDaysThunk = createAsyncThunk<
    PlanDay[],
    string,
    { rejectValue: string }
>(
    "planDays/fetchByPlanId",
    async (planId, { rejectWithValue }) => {
        try {
            const res = await dataClient.models.PlanDay.list({ filter: { planId: { eq: planId } } });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            console.error(err);
            return rejectWithValue("Failed to fetch plan days");
        }
    }
);

const planDaysSlice = createSlice({
    name: "planDays",
    initialState,
    reducers: {
        reset: () => initialState,
        dayAdded: (state, action: PayloadAction<PlanDay>) => {
            state.days.push(action.payload);
        },
        dayRemoved: (state, action: PayloadAction<string>) => {
            state.days = state.days.filter((d) => d.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlanDaysThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlanDaysThunk.fulfilled, (state, action: PayloadAction<PlanDay[]>) => {
                state.loading = false;
                state.days = action.payload;
            })
            .addCase(fetchPlanDaysThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset, dayAdded, dayRemoved } = planDaysSlice.actions;
export default planDaysSlice.reducer;
