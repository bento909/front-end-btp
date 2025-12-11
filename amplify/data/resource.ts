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
            planExercise: a.belongsTo("PlanExercise", "planExerciseId"),
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

//Reusable stuff for Refactoring??
//import { a, type ClientSchema, defineData } from "@aws-amplify/backend";
// 
// // === Reusable TypeScript type ===
// export type CompletedSet = {
//   weight?: number;
//   reps?: number;
//   time?: number;
//   distance?: number;
//   [key: string]: any;
// };
// 
// // === Reusable schema field objects ===
// const idField = a.id();
// const stringRequired = a.string().required();
// const stringOptional = a.string();
// const datetimeRequired = a.datetime().required();
// const booleanDefault = (def: boolean) => a.boolean().default(def);
// const integerOptional = a.integer();
// const floatOptional = a.float();
// 
// // === Prebuilt objects for models ===
// const contactMessageFields = {
//   id: idField,
//   name: stringRequired,
//   email: stringRequired,
//   message: stringRequired,
//   createdAt: datetimeRequired,
//   read: booleanDefault(false),
// };
// 
// const planFields = {
//   id: idField,
//   name: stringRequired,
//   trainerEmail: stringRequired,
//   clientEmail: stringRequired,
//   planDays: a.hasMany("PlanDay", "planId"),
// };
// 
// const exerciseFields = {
//   id: idField,
//   name: stringRequired,
//   type: a.enum(["LIFT", "RUN", "CYCLE", "INTERVAL", "KB_SWING"]),
//   tips: stringOptional,
//   notes: stringOptional,
//   planExercises: a.hasMany("PlanExercise", "exerciseId"),
// };
// 
// const planExerciseFields = {
//   id: idField,
//   planId: stringRequired,
//   exerciseId: stringRequired,
//   planDayId: stringOptional,
//   order: a.integer().required(),
//   suggestedReps: integerOptional,
//   suggestedWeight: floatOptional,
//   suggestedSets: integerOptional,
//   logs: a.hasMany("ExerciseLog", "planExerciseId"),
//   exercise: a.belongsTo("Exercise", "exerciseId"),
//   planDay: a.belongsTo("PlanDay", "planDayId"),
// };
// 
// const planDayFields = {
//   id: idField,
//   planId: stringRequired,
//   dayOfWeek: a.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
//   plan: a.belongsTo("Plan", "planId"),
//   dayNumber: integerOptional,
//   planExercises: a.hasMany("PlanExercise", "planDayId"),
// };
// 
// const exerciseLogFields = {
//   id: idField,
//   planExerciseId: stringRequired,
//   date: datetimeRequired,
//   sets: a.json<CompletedSet[]>().required(),
//   clientNotes: stringOptional,
//   planExercise: a.belongsTo("PlanExercise", "planExerciseId"),
// };
// 
// // === Schema ===
// const schema = a.schema({
//   ContactMessage: a.model(contactMessageFields).authorization((allow) => [allow.publicApiKey()]),
//   Plan: a.model(planFields).authorization((allow) => [allow.publicApiKey()]),
//   Exercise: a.model(exerciseFields).authorization((allow) => [allow.publicApiKey()]),
//   PlanExercise: a.model(planExerciseFields).authorization((allow) => [allow.publicApiKey()]),
//   PlanDay: a.model(planDayFields).authorization((allow) => [allow.publicApiKey()]),
//   ExerciseLog: a.model(exerciseLogFields).authorization((allow) => [allow.publicApiKey()]),
// });
// 
// // === Export ===
// export type Schema = ClientSchema<typeof schema>;
// 
// export const data = defineData({
//   schema,
//   authorizationModes: {
//     defaultAuthorizationMode: "apiKey",
//     apiKeyAuthorizationMode: {
//       expiresInDays: 30,
//     },
//   },
// });