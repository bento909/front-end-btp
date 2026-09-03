import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Profile, User } from "../Constants/constants.tsx";
import { PermissionService } from "../Helpers/PermissionService.tsx";
import { dataClient } from "../graphql/dataClient.ts";

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

// Async thunk for fetching users — via the listOrgUsers custom query
// (amplify/functions/listOrgUsers), which is scoped server-side to the
// caller's own organization (Cognito group membership). Replaces the old
// FetchUsers.tsx, which manually parsed a Cognito token out of localStorage
// and called a standalone, unscoped, separately-hand-deployed Lambda.
export const fetchUsersThunk = createAsyncThunk<User[]>(
    "users/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await dataClient.queries.listOrgUsers({});
            if (response.errors?.length) {
                throw new Error(response.errors.map((e) => e.message).join("; "));
            }
            const orgUsers = response.data ?? [];
            return orgUsers
                .filter((u): u is NonNullable<typeof u> => u !== null)
                .map((u) => ({
                    id: u.id ?? "",
                    name: u.name || "Unknown",
                    emailAddress: u.email || "No email",
                    profile: (u.role as Profile) || Profile.BASIC_USER,
                    organizationId: u.organizationId ?? "",
                    permissions: PermissionService.getPermissions((u.role as Profile) || Profile.BASIC_USER),
                }));
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch users");
        }
    }
);

// Create slice
const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        reset: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsersThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;
