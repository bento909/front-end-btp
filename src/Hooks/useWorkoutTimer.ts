import { useRef, useState, useCallback } from "react";

export function useWorkoutTimer() {
    const [display, setDisplay] = useState("00:00");
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);

    const endTimestampRef = useRef<number | null>(null);
    const lastBeepSecondRef = useRef<number>(Infinity);
    const rafRef = useRef<number | null>(null);

    // ---- AUDIO ----
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

    // ---- MAIN TICK ----
    const tick = useCallback(
        (totalSeconds: number) => {
            const now = Date.now();
            const remainingMs = endTimestampRef.current! - now;

            if (remainingMs <= 0) {
                setDisplay("00:00");

                // final triple beep
                beep(200, 700);
                setTimeout(() => beep(200, 700), 300);
                setTimeout(() => beep(200, 700), 600);

                rafRef.current = null;
                return;
            }

            const remainingSeconds = Math.ceil(remainingMs / 1000);

            const m = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
            const s = String(remainingSeconds % 60).padStart(2, "0");
            setDisplay(`${m}:${s}`);

            // --- BEEP LOGIC (minute + 30-second) ---
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
        [setDisplay]
    );

    // ---- PUBLIC START ----
    const start = useCallback((exerciseName: string, durationSeconds: number) => {
        setTitle(exerciseName);
        setOpen(true);

        // 7s prep phase
        let prep = 7;
        setDisplay(`Get Ready: ${prep}`);

        const prepInterval = setInterval(() => {
            prep--;
            setDisplay(`Get Ready: ${prep}`);

            if (prep === 0) {
                clearInterval(prepInterval);
                beep();
                // start main timer
                lastBeepSecondRef.current = Infinity;
                endTimestampRef.current = Date.now() + durationSeconds * 1000;
                rafRef.current = requestAnimationFrame(() =>
                    tick(durationSeconds)
                );
            }
        }, 1000);
    }, [tick]);

    const stop = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        setOpen(false);
        setDisplay("00:00");
    }, []);

    return {
        open,
        title,
        display,
        start,
        stop,
    };
}
