import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dataClient } from "../graphql/dataClient.ts";
import type { Schema } from "../../amplify/data/resource";

type ContactMessage = Schema["ContactMessage"]["type"];
export type CreateContactMessageInput = { name: string; email: string; message: string; createdAt: string; read?: boolean };
export type UpdateContactMessageInput = { id: string; read: boolean };
export type DeleteContactMessageInput = { id: string };

interface ContactMessagesState {
    messages: ContactMessage[];
    loading: boolean;
    error: string | null;
}

const initialState: ContactMessagesState = {
    messages: [],
    loading: false,
    error: null,
};

// === Thunks ===

// Fetch all messages
export const fetchMessagesThunk = createAsyncThunk(
    "contactMessages/fetchAll",
    async (_, thunkAPI) => {
        try {
            const res = await dataClient.models.ContactMessage.list();
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to fetch contact messages");
        }
    }
);

// Fetch only unread messages
export const fetchUnreadMessagesThunk = createAsyncThunk(
    "contactMessages/fetchUnread",
    async (_, thunkAPI) => {
        try {
            const res = await dataClient.models.ContactMessage.list({ filter: { read: { eq: false } } });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to fetch unread messages");
        }
    }
);

// Create message — iam, not the client's default userPool: the public
// contact form is submitted by anonymous visitors with no Cognito session —
// this runs under the identity pool's guest role, matching allow.guest() on
// ContactMessage's create rule.
export const addMessageThunk = createAsyncThunk(
    "contactMessages/add",
    async (input: CreateContactMessageInput, thunkAPI) => {
        try {
            const res = await dataClient.models.ContactMessage.create(input, { authMode: "iam" });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to create message");
        }
    }
);

// Update message (read/unread)
export const updateMessageThunk = createAsyncThunk(
    "contactMessages/update",
    async (input: UpdateContactMessageInput, thunkAPI) => {
        try {
            const res = await dataClient.models.ContactMessage.update(input);
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to update message");
        }
    }
);

// Delete message
export const deleteMessageThunk = createAsyncThunk(
    "contactMessages/delete",
    async (input: DeleteContactMessageInput, thunkAPI) => {
        try {
            const res = await dataClient.models.ContactMessage.delete(input);
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            return res.data?.id;
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to delete message");
        }
    }
);

// === Slice ===
const contactMessagesSlice = createSlice({
    name: "contactMessages",
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchMessagesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchMessagesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch unread
            .addCase(fetchUnreadMessagesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnreadMessagesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchUnreadMessagesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add
            .addCase(addMessageThunk.fulfilled, (state, action) => {
                if (action.payload) state.messages.push(action.payload);
            })

            // Update
            .addCase(updateMessageThunk.fulfilled, (state, action) => {
                if (!action.payload) return;
                const index = state.messages.findIndex(m => m.id === action.payload!.id);
                if (index >= 0) state.messages[index] = { ...state.messages[index], ...action.payload };
            })

            // Delete
            .addCase(deleteMessageThunk.fulfilled, (state, action) => {
                state.messages = state.messages.filter(m => m.id !== action.payload);
            });
    }
});

export const { clearMessages } = contactMessagesSlice.actions;
export default contactMessagesSlice.reducer;
