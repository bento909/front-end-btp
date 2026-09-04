import {useTimer} from "../../../Context/WorkoutTimerContext.tsx";

export interface Phase {
    name: string;
    duration: number; // seconds
}

export interface IntervalTimerData {
    name: string;
    phases: Phase[];
}

// Utility to run an interval timer
export function runIntervalTimer(timerHook: ReturnType<typeof useTimer>, timerData: IntervalTimerData) {
    let index = 0;

    const runNextPhase = () => {
        if (index >= timerData.phases.length) return;

        const phase = timerData.phases[index];
        const isLast = index === timerData.phases.length - 1;

        timerHook.setOnComplete(() => {
            if (!isLast) {
                index++;
                runNextPhase();
            } else {
                // Final 8-beep sequence
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => timerHook.beep(200, 700), i * 300);
                }
            }
        });
        timerHook.start(phase.name, phase.duration, { skipPrep: index !== 0 });
    };

    runNextPhase();
}
