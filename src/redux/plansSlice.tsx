import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dataClient } from "../graphql/dataClient.ts";
import type { Schema } from "../../amplify/data/resource";

export type Plan = Schema["Plan"]["type"];

// Flat — no nested planDays/planExercises. Those are fetched separately
// (planDaysSlice, planExercisesSlice) so a plan with many days doesn't pull
// every day's exercises just to show the plan itself.
interface PlansState {
    plan: Plan | null;
    loading: boolean;
    error: string | null;
}

const initialState: PlansState = {
    plan: null,
    loading: false,
    error: null,
};

export const fetchPlanByClientEmailThunk = createAsyncThunk<
    Plan | null,
    string,
    { rejectValue: string }
>(
    "plans/fetchPlanByClientEmail",
    async (clientEmail, { rejectWithValue }) => {
        try {
            const res = await dataClient.models.Plan.list({ filter: { clientEmail: { eq: clientEmail } } });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data[0] ?? null;
        } catch (err) {
            console.error(err);
            return rejectWithValue("Failed to fetch plan");
        }
    }
);

const plansSlice = createSlice({
    name: "plans",
    initialState,
    reducers: {
        reset: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlanByClientEmailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlanByClientEmailThunk.fulfilled, (state, action: PayloadAction<Plan | null>) => {
                state.loading = false;
                state.plan = action.payload;
            })
            .addCase(fetchPlanByClientEmailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset } = plansSlice.actions;
export default plansSlice.reducer;
