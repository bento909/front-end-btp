import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../graphql/graphqlClient";
import { GraphQLQueries } from "../graphql/queries";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListExercisesQuery } from "../graphql/types";

interface ExercisesState {
    exercises: ListExercisesQuery["listExercises"]["items"];
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
            const res = (await client.graphql({
                query: GraphQLQueries.listExercises,
            })) as GraphQLResult<ListExercisesQuery>;

            return res.data?.listExercises?.items ?? [];
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
