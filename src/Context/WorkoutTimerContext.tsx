import { createContext, useContext } from "react";
import { useWorkoutTimer } from "../Hooks/useWorkoutTimer";

const WorkoutTimerContext = createContext<any>(null);

export const WorkoutTimerProvider = ({ children }: { children: React.ReactNode }) => {
    const timer = useWorkoutTimer();
    return (
        <WorkoutTimerContext.Provider value={timer}>
            {children}
        </WorkoutTimerContext.Provider>
    );
};

export const useTimer = () => useContext(WorkoutTimerContext);
