import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import authReducer from "./authSlice";
import exercisesReducer from "./exercisesSlice";
import contactMessagesReducer from "./contactMessagesSlice"
import plansReducer from "./plansSlice.tsx"
import exerciseLogsReducer from "./exerciseLogSlice.tsx"
import planDaysReducer from "./planDaysSlice.tsx"
import planExercisesReducer from "./planExercisesSlice.tsx"

const store = configureStore({
    reducer: {
        users: usersReducer,
        auth: authReducer,
        exercises: exercisesReducer,
        contactMessages: contactMessagesReducer,
        plans: plansReducer,
        exerciseLogs: exerciseLogsReducer,
        planDays: planDaysReducer,
        planExercises: planExercisesReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
