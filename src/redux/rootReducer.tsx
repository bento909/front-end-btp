import {combineReducers, UnknownAction} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';

const appReducer = combineReducers({
    auth: authReducer,
    users: usersReducer,
    // Add other reducers as needed
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
    if (action.type === 'USER_LOGOUT') {
        state = undefined; // Reset state to initial values
    }
    return appReducer(state, action);
};

export default rootReducer;
