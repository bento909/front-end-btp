import { useRef, useState, useCallback } from "react";
import { useWakeLock } from "./useWakeLock";

export function useWorkoutTimer() {
    const [display, setDisplay] = useState("00:00");
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useWakeLock(isRunning);

    const endTimestampRef = useRef<number | null>(null);
    const pauseRemainingRef = useRef<number>(0);
    const lastBeepSecondRef = useRef<number>(Infinity);
    const rafRef = useRef<number | null>(null);
    const prepIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /* ---- AUDIO ---- */
    let audioCtx: AudioContext | null = null;
    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
        }
        return audioCtx;
    }
    function beep(duration = 200, freq = 600, volume = 1) {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration / 1000);
    }

    /* ---- TICK ---- */
    const tick = useCallback(
        (totalSeconds: number) => {
            if (isPaused) return;

            const now = Date.now();
            const remainingMs = endTimestampRef.current! - now;

            if (remainingMs <= 0) {
                setDisplay("00:00");

                // triple beep
                beep(200, 700);
                setTimeout(() => beep(200, 700), 300);
                setTimeout(() => beep(200, 700), 600);

                // schedule auto close
                autoCloseTimeoutRef.current = setTimeout(() => setOpen(false), 3000);

                setIsRunning(false);
                rafRef.current = null;
                return;
            }

            const remainingSeconds = Math.ceil(remainingMs / 1000);

            const m = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
            const s = String(remainingSeconds % 60).padStart(2, "0");
            setDisplay(`${m}:${s}`);

            const crossed = remainingSeconds < lastBeepSecondRef.current;

            const minuteMark =
                remainingSeconds % 60 === 0 &&
                remainingSeconds !== totalSeconds;

            const halfMinute =
                remainingSeconds % 30 === 0 &&
                remainingSeconds % 60 !== 0 &&
                remainingSeconds !== totalSeconds;

            if (crossed) {
                if (minuteMark) beep(150, 700);
                else if (halfMinute) beep(80, 500);
            }

            lastBeepSecondRef.current = remainingSeconds;

            rafRef.current = requestAnimationFrame(() =>
                tick(totalSeconds)
            );
        },
        [isPaused]
    );

    /* ---- START ---- */
    const start = useCallback((exerciseName: string, durationSeconds: number) => {
        setTitle(exerciseName);
        setOpen(true);
        setIsRunning(true);
        setIsPaused(false);

        lastBeepSecondRef.current = Infinity;

        // clear stale timeouts
        if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);

        // 7s prep
        let prep = 7;
        setDisplay(`Get Ready: ${prep}`);

        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);

        prepIntervalRef.current = setInterval(() => {
            prep--;
            setDisplay(`Get Ready: ${prep}`);

            if (prep === 0) {
                clearInterval(prepIntervalRef.current!);
                beep();

                endTimestampRef.current = Date.now() + durationSeconds * 1000;

                rafRef.current = requestAnimationFrame(() =>
                    tick(durationSeconds)
                );
            }
        }, 1000);
    }, [tick]);

    /* ---- PAUSE ---- */
    const pause = useCallback(() => {
        if (!isRunning) return;
        setIsPaused(true);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        pauseRemainingRef.current =
            endTimestampRef.current! - Date.now();
    }, [isRunning]);

    /* ---- RESUME ---- */
    const resume = useCallback(() => {
        if (!isPaused) return;
        setIsPaused(false);

        endTimestampRef.current = Date.now() + pauseRemainingRef.current;
        rafRef.current = requestAnimationFrame(() => tick(999999)); // seconds ignored
    }, [isPaused, tick]);

    /* ---- STOP ---- */
    const stop = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current);
        if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);

        rafRef.current = null;

        setIsRunning(false);
        setIsPaused(false);
        setOpen(false);
        setDisplay("00:00");
    }, []);

    return {
        open,
        title,
        display,
        isPaused,
        start,
        pause,
        resume,
        stop,
    };
}
