import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../graphql/graphqlClient";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { listContactMessages, listUnreadContactMessages } from "../graphql/ContactMessage/contactMessageQueries.ts";
import { createContactMessage, updateContactMessage, deleteContactMessage } from "../graphql/ContactMessage/contactMessageMutations.ts";

import {
    ListContactMessagesQuery,
    ListUnreadContactMessagesQuery,
    CreateContactMessageInput,
    UpdateContactMessageInput,
    DeleteContactMessageInput
} from "../graphql/ContactMessage/contactMessageTypes.ts";

interface ContactMessagesState {
    messages: ListContactMessagesQuery["listContactMessages"]["items"];
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
            const res = (await client.graphql({
                query: listContactMessages,
            })) as GraphQLResult<ListContactMessagesQuery>;

            return res.data?.listContactMessages?.items ?? [];
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
            const res = (await client.graphql({
                query: listUnreadContactMessages,
            })) as GraphQLResult<ListUnreadContactMessagesQuery>;

            return res.data?.listContactMessages?.items ?? [];
        } catch (err) {
            return thunkAPI.rejectWithValue("Failed to fetch unread messages");
        }
    }
);

// Create message
export const addMessageThunk = createAsyncThunk(
    "contactMessages/add",
    async (input: CreateContactMessageInput, thunkAPI) => {
        try {
            console.log('Inside AddMessageThunk - input is: ' + input)
            const res = (await client.graphql({
                query: createContactMessage,
                variables: { input },
            })) as GraphQLResult<{ createContactMessage: any }>;
            console.log('GraphQL response:', res);
            return res.data?.createContactMessage;
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
            const res = (await client.graphql({
                query: updateContactMessage,
                variables: { input },
            })) as GraphQLResult<{ updateContactMessage: any }>;

            return res.data?.updateContactMessage;
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
            const res = (await client.graphql({
                query: deleteContactMessage,
                variables: { input },
            })) as GraphQLResult<{ deleteContactMessage: { id: string } }>;

            return res.data?.deleteContactMessage.id;
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
                state.messages.push(action.payload);
            })

            // Update
            .addCase(updateMessageThunk.fulfilled, (state, action) => {
                const index = state.messages.findIndex(m => m.id === action.payload.id);
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
