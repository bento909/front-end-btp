import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import authReducer from "./authSlice";
import exercisesReducer from "./exercisesSlice"; // <- add this

const store = configureStore({
    reducer: {
        users: usersReducer, // Add users to Redux store
        auth: authReducer, // Add authentication state
        exercises: exercisesReducer, // <- include it
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
