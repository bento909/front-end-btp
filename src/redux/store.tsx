import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import authReducer from "./authSlice";
import exercisesReducer from "./exercisesSlice";
import contactMessagesReducer from "./contactMessagesSlice"
import plansReducer from "./plansSlice.tsx"
import exerciseLogsReducer from "./exerciseLogSlice.tsx"

const store = configureStore({
    reducer: {
        users: usersReducer,
        auth: authReducer,
        exercises: exercisesReducer,
        contactMessages: contactMessagesReducer,
        plans: plansReducer,
        exerciseLogs: exerciseLogsReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
