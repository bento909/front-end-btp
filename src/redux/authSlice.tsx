import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { Profile, User } from "../Constants/constants.tsx";
import { PermissionService } from "../Helpers/PermissionService.tsx";

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};

// Fetch user attributes from AWS
export const fetchAuthUser = createAsyncThunk<User>(
    "auth/fetchUser",
    async (_, { rejectWithValue }) => {
        try {
            const attributes = await fetchUserAttributes();
            // custom:role replaces the old, misused standard "profile"
            // attribute (OIDC defines "profile" as a profile-page URL, not
            // a role). custom:organizationId replaces custom:creatorEmail —
            // the real tenant relationship is Cognito group membership, of
            // which this is the group name, not an informal "who created
            // this account" email string.
            const userTypeString = attributes['custom:role'] || "basic_user";
            const userType: Profile = userTypeString as Profile;
            const session = await fetchAuthSession();
            const groups = (session.tokens?.idToken?.payload['cognito:groups'] as string[] | undefined) || [];
            return {
                id: attributes.sub || "", // Use `sub` as a unique user ID
                name: attributes.name || "wonderful human",
                emailAddress: attributes.email || "",
                profile: userType,
                organizationId: attributes['custom:organizationId'] || "",
                permissions: PermissionService.getPermissions(userType),
                groups,
            };
        } catch (error) {
            return rejectWithValue("Failed to fetch user attributes");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthState: () => initialState,
        updateAuthUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuthUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAuthUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchAuthUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateAuthUser, resetAuthState } = authSlice.actions;
export default authSlice.reducer;