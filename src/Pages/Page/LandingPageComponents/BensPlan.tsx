import React, {useRef, useState} from "react";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import {useTimer} from "../../../Context/WorkoutTimerContext.tsx";

/* ------------------------------------------
   TYPES
------------------------------------------- */

type ExerciseID = "e1" | "e2" | "e3" | "e4" | "e5" | "e6";

const EXERCISE_COLORS: Record<ExerciseID, string> = {
    e1: "#ffdddd",
    e2: "#ddffdd",
    e3: "#ddddff",
    e4: "#fff0cc",
    e5: "#e0ccff",
    e6: "#ccf0ff",
};

interface Exercise {
    id: ExerciseID;
    name: string;
}

interface WeekData {
    A: ExerciseID[];
    B: ExerciseID[];
    C: ExerciseID[];
}

interface StoredWeek {
    weekStart: string;
    week: WeekData;
}

/* ------------------------------------------
   DEFAULT EXERCISES
------------------------------------------- */

const DEFAULT_EXERCISES: Exercise[] = [
    {id: "e1", name: "Pull-ups"},
    {id: "e2", name: "Clean & Press"},
    {id: "e3", name: "Mill"},
    {id: "e4", name: "Shield Cast"},
    {id: "e5", name: "Burpees"},
    {id: "e6", name: "Swing"},
];

/* ------------------------------------------
   STORAGE HELPERS
------------------------------------------- */

function loadExercises(): Exercise[] {
    const stored = localStorage.getItem("exercises");
    if (stored) {
        try {
            const parsed = JSON.parse(stored) as Exercise[];
            if (Array.isArray(parsed)) return parsed;
        } catch {
        }
    }

    localStorage.setItem("exercises", JSON.stringify(DEFAULT_EXERCISES));
    return DEFAULT_EXERCISES;
}

function saveExercises(list: Exercise[]) {
    localStorage.setItem("exercises", JSON.stringify(list));
}

/* ------------------------------------------
   AUDIO
------------------------------------------- */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
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

/* ------------------------------------------
   WEEK GENERATION
------------------------------------------- */

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function makeWeek(exerciseIDs: ExerciseID[]): WeekData {
    const week: WeekData = {
        A: Array(6).fill(null) as ExerciseID[],
        B: Array(6).fill(null) as ExerciseID[],
        C: Array(6).fill(null) as ExerciseID[],
    };

    const usedWeek = {
        A: {} as Record<ExerciseID, boolean>,
        B: {} as Record<ExerciseID, boolean>,
        C: {} as Record<ExerciseID, boolean>,
    };

    exerciseIDs.forEach((e) => {
        usedWeek.A[e] = false;
        usedWeek.B[e] = false;
        usedWeek.C[e] = false;
    });

    for (let day = 0; day < 6; day++) {
        const usedToday: Record<ExerciseID, boolean> = {
            e1: false,
            e2: false,
            e3: false,
            e4: false,
            e5: false,
            e6: false,
        };

        // A (15 minutes)
        let allowedA = exerciseIDs.filter(
            (e) => !usedToday[e] && !usedWeek.A[e]
        );
        if (day > 0) {
            allowedA = allowedA.filter((e) => e !== week.B[day - 1]);
        }
        if (!allowedA.length) return makeWeek(exerciseIDs);
        const A = pickRandom(allowedA);
        week.A[day] = A;
        usedToday[A] = true;
        usedWeek.A[A] = true;

        // B (10 minutes)
        let allowedB = exerciseIDs.filter(
            (e) => !usedToday[e] && !usedWeek.B[e]
        );
        if (day > 0) {
            allowedB = allowedB.filter((e) => e !== week.A[day - 1]);
        }
        if (!allowedB.length) return makeWeek(exerciseIDs);
        const B = pickRandom(allowedB);
        week.B[day] = B;
        usedToday[B] = true;
        usedWeek.B[B] = true;

        // C (5 minutes)
        let allowedC = exerciseIDs.filter(
            (e) => !usedToday[e] && !usedWeek.C[e]
        );
        if (!allowedC.length) return makeWeek(exerciseIDs);
        const C = pickRandom(allowedC);
        week.C[day] = C;
        usedToday[C] = true;
        usedWeek.C[C] = true;
    }

    return week;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function loadOrCreateWeek(exerciseIDs: ExerciseID[]): WeekData {
    const stored = localStorage.getItem("currentWeek");
    const today = new Date();
    const monday = getMonday(today);

    if (stored) {
        try {
            const parsed = JSON.parse(stored) as StoredWeek;
            const storedMonday = new Date(parsed.weekStart);
            if (storedMonday.getTime() === monday.getTime()) {
                return parsed.week;
            }
        } catch {
        }
    }

    const newWeek = makeWeek(exerciseIDs);

    const toStore: StoredWeek = {
        weekStart: monday.toISOString(),
        week: newWeek,
    };

    localStorage.setItem("currentWeek", JSON.stringify(toStore));
    return newWeek;
}

/* ------------------------------------------
   MAIN COMPONENT
------------------------------------------- */

const WorkoutScheduler: React.FC = () => {
    const [exercises, setExercises] = useState<Exercise[]>(loadExercises);
    const exerciseNames = Object.fromEntries(
        exercises.map((ex) => [ex.id, ex.name])
    ) as Record<ExerciseID, string>;

    const exerciseIDs = exercises.map((e) => e.id);

    const [week] = useState<WeekData>(() => loadOrCreateWeek(exerciseIDs));

    const {start} = useTimer();

    const [editing, setEditing] = useState<boolean>(false);

    // Double-click-ish logic
    const lastClickExercise = useRef<ExerciseID | null>(null);
    const lastClickTime = useRef<number>(0);
    const toggleState = useRef<boolean>(false);

    const handleExerciseClick = (exID: ExerciseID) => {
        const now = Date.now();

        if (
            lastClickExercise.current === exID &&
            now - lastClickTime.current < 2000
        ) {
            toggleState.current = !toggleState.current; // toggle
        } else {
            toggleState.current = false; // reset to 5 mins
        }

        lastClickExercise.current = exID;
        lastClickTime.current = now;

        const duration = toggleState.current ? 600 : 300; // 10 mins or 5 mins
        start(exerciseNames[exID], duration);
    };

    const updateExerciseName = (id: ExerciseID, name: string) => {
        const updated = exercises.map((e) =>
            e.id === id ? {...e, name} : e
        );
        setExercises(updated);
        saveExercises(updated);
    };

    const today = new Date();
    const monday = getMonday(today);

    return (
        <div>
            {editing && (
                <div style={{padding: 10, marginTop: 10}}>
                    {exercises.map((ex) => (
                        <div key={ex.id} style={{marginBottom: 8}}>
                            <input
                                value={ex.name}
                                onChange={(e) =>
                                    updateExerciseName(ex.id, e.target.value)
                                }
                                style={{width: "100%", padding: 6}}
                            />
                        </div>
                    ))}
                </div>
            )}

            <table style={{borderCollapse: "collapse", width: "100%", marginTop: 16}}>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>15 mins</th>
                    <th>10 mins</th>
                    <th>5 mins</th>
                </tr>
                </thead>
                <tbody>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const day = new Date(monday);
                    day.setDate(monday.getDate() + i);

                    const isToday =
                        day.toDateString() === today.toDateString();

                    const A = week.A[i];
                    const B = week.B[i];
                    const C = week.C[i];

                    const cells: ExerciseID[] = [A, B, C];

                    return (
                        <tr key={i}>
                            <td>{day.toDateString()}</td>

                            {cells.map((ex) => (
                                <td
                                    key={ex}
                                    onClick={() =>
                                        isToday && !editing &&
                                        handleExerciseClick(ex)
                                    }
                                    style={{
                                        padding: 8,
                                        cursor: isToday && !editing ? "pointer" : "default",
                                        background: EXERCISE_COLORS[ex],
                                        textAlign: "center",
                                        border: isToday ? "3px solid #333" : "1px solid #ccc",
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

            <div>
                <span>
                    <button
                        style={{marginTop: 20}}
                        onClick={() => beep(300, 600)}>
                        Test Beep
                    </button>
                </span>
                <span>
                    <button onClick={() => setEditing((x) => !x)}>
                        {editing ? "Done Editing" : "Edit Exercises"}
                    </button>
                </span>
            </div>


        </div>
    );
};

/* ------------------------------------------
   WRAPPER
------------------------------------------- */

const BensPlan: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <CollapsiblePanel
            title="Ben's Plan"
            isOpen={isOpen}
            toggle={() => setIsOpen((x) => !x)}
        >
            <WorkoutScheduler/>
        </CollapsiblePanel>
    );
};

export default BensPlan;
