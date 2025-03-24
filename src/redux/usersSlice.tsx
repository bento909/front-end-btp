import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUsers } from "../Api/FetchUsers";
import { ApiUser, Profile, User } from "../Constants/constants.tsx";
import { PermissionService } from "../Helpers/PermissionService.tsx";

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

const transformUserData = (rawUsers: ApiUser[]): User[] => {
    return rawUsers.map((user) => {
        const attributes = user.Attributes.reduce((acc: Record<string, string>, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
        }, {});

        return {
            id: user.Username,
            name: attributes.name || "Unknown",
            emailAddress: attributes.email || "No email",
            profile: attributes.profile as Profile || Profile.BASIC_USER,
            creator: attributes.zoneinfo || "No zone info",
            permissions: PermissionService.getPermissions(attributes.profile as Profile)
        };
    });
};

// Async thunk for fetching users
export const fetchUsersThunk = createAsyncThunk<User[]>(
    "users/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response: ApiUser[] = await fetchUsers();
            return transformUserData(response);
        } catch (error) {
            return rejectWithValue("Failed to fetch users");
        }
    }
);

// Create slice
const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {},
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

export default usersSlice.reducer;
