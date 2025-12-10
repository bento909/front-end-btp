import React, { useEffect, useState, useRef } from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";

const exercises = ["e1", "e2", "e3", "e4", "e5", "e6"];

const exerciseNames: Record<string, string> = {
    e1: "Pull-ups",
    e2: "Clean & Press",
    e3: "Mill",
    e4: "Shield Cast",
    e5: "Burpees",
    e6: "Swing",
};

// ----- AUDIO (shared) -----
let audioCtx: AudioContext | null = null;
function getAudioCtx() {
    if (!audioCtx) {
        // handle Safari prefixed context
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}
function beep(duration = 200, frequency = 600, volume = 1) {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
}

// ----- HELPERS -----
function pickRandom<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function makeWeek() {
    const week: { A: string[]; B: string[]; C: string[] } = {
        A: Array(6).fill(null),
        B: Array(6).fill(null),
        C: Array(6).fill(null),
    };

    const usedWeek: any = { A: {}, B: {}, C: {} };
    exercises.forEach((e) => {
        usedWeek.A[e] = usedWeek.B[e] = usedWeek.C[e] = false;
    });

    for (let day = 0; day < 6; day++) {
        const usedToday: any = {};
        exercises.forEach((e) => (usedToday[e] = false));

        let allowedA = exercises.filter((e) => !usedToday[e] && !usedWeek.A[e]);
        if (day > 0) allowedA = allowedA.filter((e) => e !== week.B[day - 1]);
        if (!allowedA.length) return makeWeek();
        const A = pickRandom(allowedA);
        week.A[day] = A;
        usedToday[A] = true;
        usedWeek.A[A] = true;

        let allowedB = exercises.filter((e) => !usedToday[e] && !usedWeek.B[e]);
        if (day > 0) allowedB = allowedB.filter((e) => e !== week.A[day - 1]);
        if (!allowedB.length) return makeWeek();
        const B = pickRandom(allowedB);
        week.B[day] = B;
        usedToday[B] = true;
        usedWeek.B[B] = true;

        let allowedC = exercises.filter((e) => !usedToday[e] && !usedWeek.C[e]);
        if (!allowedC.length) return makeWeek();
        const C = pickRandom(allowedC);
        week.C[day] = C;
        usedToday[C] = true;
        usedWeek.C[C] = true;
    }

    return week;
}

function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function loadOrCreateWeek() {
    const stored = localStorage.getItem("currentWeek");
    const today = new Date();
    const monday = getMonday(today);

    if (stored) {
        try {
            const obj = JSON.parse(stored);
            const storedMonday = new Date(obj.weekStart);
            if (storedMonday.getTime() === monday.getTime()) {
                return obj.week;
            }
        } catch {
            // fall through and recreate
        }
    }

    const newWeek = makeWeek();
    localStorage.setItem(
        "currentWeek",
        JSON.stringify({
            weekStart: monday.toISOString(),
            week: newWeek,
        })
    );
    return newWeek;
}

/**
 * WorkoutScheduler - internal component that contains all logic from your HTML/JS version
 */
function WorkoutScheduler() {
    const [week] = useState<any>(() => loadOrCreateWeek());
    const [timerOpen, setTimerOpen] = useState(false);
    const [timerTitle, setTimerTitle] = useState("");
    const [timerDisplay, setTimerDisplay] = useState("00:00");

    const timerRef = useRef<number | null>(null);
    const prepRef = useRef<number | null>(null);
    const secondsRef = useRef(0);
    const lastClickExercise = useRef<string | null>(null);
    const lastClickTime = useRef<number>(0);
    const toggleState = useRef<boolean>(false);

    let wakeLock: any = null;

    async function requestWakeLock() {
        try {
            // @ts-ignore - TS doesn't know this API yet
            wakeLock = await navigator.wakeLock.request("screen");
            wakeLock.addEventListener("release", () => {
                console.log("Wake Lock was released");
            });
            console.log("Wake Lock active");
        } catch (err) {
            const e = err as any;
            console.error(`${e.name}, ${e.message}`);
        }
    }

    function releaseWakeLock() {
        try {
            if (wakeLock) {
                wakeLock.release();
                wakeLock = null;
            }
        } catch {}
    }

    useEffect(() => {
        // nothing needed on mount for now; week already initialized
        return () => {
            // cleanup intervals when unmounting
            if (timerRef.current) window.clearInterval(timerRef.current);
            if (prepRef.current) window.clearInterval(prepRef.current);
        };
    }, []);

    const startTimer = (exName: string, durationSeconds: number) => {
        requestWakeLock(); // 👈 keeps the screen awake
        let prep = 7;
        setTimerOpen(true);
        setTimerTitle(`${exerciseNames[exName]} — ${durationSeconds / 60} min`);
        setTimerDisplay(`Get Ready: ${prep}`);

        if (timerRef.current) window.clearInterval(timerRef.current);
        if (prepRef.current) window.clearInterval(prepRef.current);

        prepRef.current = window.setInterval(() => {
            prep--;
            setTimerDisplay(`Get Ready: ${prep}`);
            if (prep === 0) {
                if (prepRef.current) window.clearInterval(prepRef.current);
                beep();
                runMainTimer(durationSeconds);
            }
        }, 1000);
    };

    const runMainTimer = (totalSeconds: number) => {
        secondsRef.current = totalSeconds;
        timerRef.current = window.setInterval(() => {
            secondsRef.current--;
            const m = String(Math.floor(secondsRef.current / 60)).padStart(2, "0");
            const s = String(secondsRef.current % 60).padStart(2, "0");
            setTimerDisplay(`${m}:${s}`);

            if (s === "00" && secondsRef.current > 0 && secondsRef.current !== totalSeconds) {
                beep(150, 700);
            }

            if (secondsRef.current <= 0) {
                if (timerRef.current) window.clearInterval(timerRef.current);
                beep(200, 700);
                setTimeout(() => beep(200, 700), 300);
                setTimeout(() => beep(200, 700), 600);
                setTimerDisplay("Done!");
            }
        }, 1000);
    };

    const handleExerciseClick = (exName: string) => {
        const now = Date.now();
        if (lastClickExercise.current === exName && now - lastClickTime.current < 2000) {
            toggleState.current = !toggleState.current;
        } else {
            toggleState.current = false;
        }
        lastClickExercise.current = exName;
        lastClickTime.current = now;

        const duration = toggleState.current ? 10 * 60 : 5 * 60;
        startTimer(exName, duration);
    };

    const stopTimer = () => {
        releaseWakeLock(); // 👈 allow screen to sleep again
        if (timerRef.current) window.clearInterval(timerRef.current);
        if (prepRef.current) window.clearInterval(prepRef.current);
        setTimerOpen(false);
        setTimerDisplay("00:00");
    };

    const today = new Date();
    const monday = getMonday(today);

    return (
        <div>
            <h2>Workout Scheduler</h2>

            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr>
                    <th style={{ border: "1px solid #ccc", padding: 8 }}>Date</th>
                    <th style={{ border: "1px solid #ccc", padding: 8 }}>15 mins</th>
                    <th style={{ border: "1px solid #ccc", padding: 8 }}>10 mins</th>
                    <th style={{ border: "1px solid #ccc", padding: 8 }}>5 mins</th>
                </tr>
                </thead>
                <tbody>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const day = new Date(monday);
                    day.setDate(monday.getDate() + i);
                    const isToday = day.toDateString() === today.toDateString();

                    const A = week.A[i];
                    const B = week.B[i];
                    const C = week.C[i];

                    return (
                        <tr key={i}>
                            <td style={{ border: "1px solid #ccc", padding: 8 }}>{day.toDateString()}</td>
                            {[A, B, C].map((ex, idx) => (
                                <td
                                    key={idx}
                                    className={ex}
                                    onClick={() => isToday && handleExerciseClick(ex)}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: 8,
                                        cursor: isToday ? "pointer" : "default",
                                        outline: isToday ? "3px solid #333" : undefined,
                                        background:
                                            ex === "e1"
                                                ? "#ffdddd"
                                                : ex === "e2"
                                                    ? "#ddffdd"
                                                    : ex === "e3"
                                                        ? "#ddddff"
                                                        : ex === "e4"
                                                            ? "#fff0cc"
                                                            : ex === "e5"
                                                                ? "#e0ccff"
                                                                : "#ccf0ff",
                                        textAlign: "center",
                                    }}
                                >
                                    {exerciseNames[ex]}
                                </td>
                            ))}
                        </tr>
                    );
                })}
                </tbody>
            </table>

            {/* Timer popup */}
            {timerOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        padding: 20,
                        border: "2px solid #444",
                        background: "white",
                        width: 240,
                        textAlign: "center",
                        borderRadius: 12,
                        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                        zIndex: 9999,
                    }}
                >
                    <h3>{timerTitle}</h3>
                    <div style={{ fontSize: 32, margin: "10px 0" }}>{timerDisplay}</div>
                    <button onClick={stopTimer}>Stop</button>
                </div>
            )}

            <div style={{ marginTop: 12 }}>
                <button onClick={() => beep(300, 600)}>Test Beep</button>
            </div>
        </div>
    );
}

/**
 * BensPlan - the actual exported component that wraps the scheduler in your CollapsiblePanel.
 */
const BensPlan: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePanel = () => setIsOpen((prev) => !prev);

    return (
        <CollapsiblePanel title="BensPlan" isOpen={isOpen} toggle={togglePanel}>
            <WorkoutScheduler />
        </CollapsiblePanel>
    );
};

export default BensPlan;
