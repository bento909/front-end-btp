import {useTimer} from "../../../Context/WorkoutTimerContext.tsx";

export interface Phase {
    name: string;
    duration: number; // seconds
}

export interface IntervalTimerData {
    name: string;
    phases: Phase[];
}

export function getTotalDuration(phases: Phase[]): number {
    return phases.reduce((sum, p) => sum + (p.duration || 0), 0);
}

export function formatTotalDuration(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
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
        const nextPhase = isLast ? undefined : timerData.phases[index + 1];
        timerHook.start(phase.name, phase.duration, {
            skipPrep: index !== 0,
            nextName: nextPhase?.name,
        });
    };

    runNextPhase();
}
