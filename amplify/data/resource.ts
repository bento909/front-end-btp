import {a, type ClientSchema, defineData} from "@aws-amplify/backend";

const schema = a.schema({
    // ===CONTACT MESSAGES+++ 
    ContactMessage: a
        .model({
            id: a.id(),
            name: a.string().required(),
            email: a.string().required(),
            message: a.string().required(),
            createdAt: a.datetime().required(),
            read: a.boolean().default(false), // ← add this
        })
        .authorization((allow) => [allow.publicApiKey()]),


    // === PLANS ===
    Plan: a
        .model({
            id: a.id(), // required by default
            name: a.string().required(),
            trainerEmail: a.string().required(),
            clientEmail: a.string().required(),
            planDays: a.hasMany("PlanDay", "planId"), // Plan has many days
        })
        .authorization((allow) => [allow.publicApiKey()]),

    // === EXERCISE POOL ===
    Exercise: a
        .model({
            id: a.id(),
            name: a.string().required(),
            type: a.enum(["LIFT", "RUN", "CYCLE", "INTERVAL", "KB_SWING"]),
            tips: a.string(), // Optional: We can leave this as a string without .optional()
            notes: a.string(), // Optional: Same here
            planExercises: a.hasMany("PlanExercise", "exerciseId"),
        })
        .authorization((allow) => [allow.publicApiKey()]),

    // === PLAN ↔ EXERCISE JOIN ===
    PlanExercise: a
        .model({
            id: a.id(),
            planId: a.string().required(),
            exerciseId: a.string().required(),
            planDayId: a.string(), // ← add this
            order: a.integer().required(),
            suggestedReps: a.integer(),
            suggestedWeight: a.float(),
            suggestedSets: a.integer(),
            logs: a.hasMany("ExerciseLog", "planExerciseId"),
            exercise: a.belongsTo("Exercise", "exerciseId"),
            planDay: a.belongsTo("PlanDay", "planDayId"), // ← and this
        })
        .authorization((allow) => [allow.publicApiKey()]),


    // === PLAN ↔ DAY JOIN ===
    PlanDay: a
        .model({
            id: a.id(),
            planId: a.string().required(),
            dayOfWeek: a.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
            plan: a.belongsTo("Plan", "planId"),
            dayNumber: a.integer(),
            planExercises: a.hasMany("PlanExercise", "planDayId"), // Exercises for this day
        })
        .authorization((allow) => [allow.publicApiKey()]),

    // === USER LOGS FOR COMPLETED WORKOUTS ===
    ExerciseLog: a
        .model({
            id: a.id(),
            planExerciseId: a.string().required(),
            date: a.datetime().required(),
            sets: a.json().required(),
            clientNotes: a.string(),
            planExercise: a.belongsTo("PlanExercise", "planExerciseId"), // Add this line
        })
        .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "apiKey",
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});
