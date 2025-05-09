import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import authReducer from "./authSlice";

const store = configureStore({
    reducer: {
        users: usersReducer, // Add users to Redux store
        auth: authReducer, // Add authentication state
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;