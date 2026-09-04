// Canonical data model for the human-browsable demo org — the single
// source of truth both provision-demo-org.ts (create if missing) and
// restore-demo-org.ts (reconcile back to exactly this, deleting/fixing
// anything that's drifted) build from. Keeping this in one place means the
// two scripts can never quietly disagree about what "correct" looks like.

export const ORG_ID = "demo-playground";
export const ORG_NAME = "Demo Playground Gym";
export const FIXED_PASSWORD = "DemoOrg!2026Prod";
export const EMAIL_PREFIX = "mathsmechanic+demo-";
export const STAFF_GROUP = `${ORG_ID}-staff`;

export const PLATFORM_ADMIN_EMAIL = `${EMAIL_PREFIX}platform-admin@gmail.com`;
export const ADMIN_EMAIL = `${EMAIL_PREFIX}admin@gmail.com`;
export const TRAINER_EMAIL = `${EMAIL_PREFIX}trainer@gmail.com`;
export const CLIENT_EMAIL = `${EMAIL_PREFIX}client@gmail.com`;

export const PLAN_NAME = "Demo Client's Training Plan";

export type ExerciseType = "LIFT" | "RUN" | "CYCLE" | "INTERVAL" | "KB_SWING";
export interface ExerciseDef {
    name: string;
    type: ExerciseType;
    tips: string;
    notes?: string;
}
export const EXERCISE_DEFS: ExerciseDef[] = [
    { name: "Barbell Squat", type: "LIFT", tips: "Keep your chest up, drive through your heels.", notes: "Focus on depth." },
    { name: "Bench Press", type: "LIFT", tips: "Retract your shoulder blades before unracking." },
    { name: "Deadlift", type: "LIFT", tips: "Keep the bar close to your shins the whole way up." },
    { name: "5k Run", type: "RUN", tips: "Maintain a steady, conversational pace." },
    { name: "Kettlebell Swing", type: "KB_SWING", tips: "Hinge at the hips, not the knees." },
    { name: "Interval Sprints", type: "INTERVAL", tips: "30 seconds on, 90 seconds rest, repeat." },
];

export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export const WEEK_DAYS: { day: DayOfWeek; num: number }[] = [
    { day: "MONDAY", num: 1 }, { day: "TUESDAY", num: 2 }, { day: "WEDNESDAY", num: 3 }, { day: "THURSDAY", num: 4 },
    { day: "FRIDAY", num: 5 }, { day: "SATURDAY", num: 6 }, { day: "SUNDAY", num: 7 },
];

export interface Assignment {
    day: DayOfWeek;
    exercise: string; // matches an EXERCISE_DEFS name
    reps: number;
    weight: number;
    sets: number;
}
// Tuesday/Thursday/Sunday are deliberately rest days — no assignments.
export const ASSIGNMENTS: Assignment[] = [
    { day: "MONDAY", exercise: "Barbell Squat", reps: 8, weight: 60, sets: 4 },
    { day: "MONDAY", exercise: "Deadlift", reps: 5, weight: 80, sets: 3 },
    { day: "WEDNESDAY", exercise: "Bench Press", reps: 8, weight: 50, sets: 4 },
    { day: "FRIDAY", exercise: "5k Run", reps: 1, weight: 0, sets: 1 },
    { day: "FRIDAY", exercise: "Kettlebell Swing", reps: 15, weight: 16, sets: 3 },
    { day: "SATURDAY", exercise: "Interval Sprints", reps: 1, weight: 0, sets: 8 },
];

// The one exercise instance that carries a logged workout — must match an
// entry in ASSIGNMENTS above (day + exercise name).
export const LOGGED_ASSIGNMENT = { day: "MONDAY" as DayOfWeek, exercise: "Barbell Squat" };
export const LOGGED_SETS = [
    { reps: "8", weight: "60" },
    { reps: "8", weight: "60" },
    { reps: "6", weight: "65" },
    { reps: "6", weight: "65" },
];
export const LOGGED_NOTES = "Felt strong today, bumped the last two sets up.";
