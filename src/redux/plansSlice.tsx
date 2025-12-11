import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { client } from "../graphql/graphqlClient";
import { GraphQLQueries } from "../graphql/queries";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListPlansQuery, Plan } from "../graphql/types";

// Define state type
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

// Async thunk: fetch plan for a given clientEmail
export const fetchPlanByClientEmailThunk = createAsyncThunk<
    Plan | null, // return type
    string,      // arg type (clientEmail)
    { rejectValue: string }
>(
    "plans/fetchPlanByClientEmail",
    async (clientEmail, { rejectWithValue }) => {
        try {
            const resp = (await client.graphql({
                query: GraphQLQueries.listPlans,
            })) as GraphQLResult<ListPlansQuery>;

            const items = resp.data?.listPlans?.items ?? [];
            return items.find((p) => p?.clientEmail === clientEmail) ?? null;
        } catch (err) {
            console.error(err);
            return rejectWithValue("Failed to fetch plan");
        }
    }
);

// Slice
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