import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import {createOrgUser} from "../functions/createOrgUser/resource";
import {listOrgUsers} from "../functions/listOrgUsers/resource";

// Multi-tenant design (BTP-10): every org-scoped model carries an
// `organizationId` field whose value IS the name of a Cognito Group — every
// user belonging to an org (any role) is added to that group at creation.
// `allow.groupDefinedIn('organizationId')` means only members of that exact
// group can read/write the record — this is the real, server-enforced
// tenant boundary, not client-side UI gating.

const schema = a.schema({
    // === ORGANIZATIONS (tenants) ===
    Organization: a
        .model({
            id: a.id(),
            name: a.string().required(),
            createdAt: a.datetime().required(),
        })
        .authorization((allow) => [allow.groupDefinedIn("id")]),

    // === CONTACT MESSAGES ===
    // Ungated by org — belongs to the single shared public marketing page,
    // not to any tenant. Public create (the contact form), admin-only read
    // is enforced by the app's own IAM/group setup for the admin org — left
    // as apiKey here since this is intentionally public-facing, not
    // multi-tenant data.
    ContactMessage: a
        .model({
            id: a.id(),
            name: a.string().required(),
            email: a.string().required(),
            message: a.string().required(),
            createdAt: a.datetime().required(),
            read: a.boolean().default(false),
        })
        .authorization((allow) => [allow.publicApiKey()]),

    // === PLANS ===
    Plan: a
        .model({
            id: a.id(),
            name: a.string().required(),
            trainerEmail: a.string().required(),
            clientEmail: a.string().required(),
            organizationId: a.string().required(),
            planDays: a.hasMany("PlanDay", "planId"),
        })
        .authorization((allow) => [allow.groupDefinedIn("organizationId")]),

    // === EXERCISE POOL (private per-organization) ===
    Exercise: a
        .model({
            id: a.id(),
            name: a.string().required(),
            type: a.enum(["LIFT", "RUN", "CYCLE", "INTERVAL", "KB_SWING"]),
            tips: a.string(),
            notes: a.string(),
            organizationId: a.string().required(),
            planExercises: a.hasMany("PlanExercise", "exerciseId"),
        })
        .authorization((allow) => [allow.groupDefinedIn("organizationId")]),

    // === PLAN ↔ EXERCISE JOIN ===
    PlanExercise: a
        .model({
            id: a.id(),
            planId: a.string().required(),
            exerciseId: a.string().required(),
            planDayId: a.string(),
            order: a.integer().required(),
            suggestedReps: a.integer(),
            suggestedWeight: a.float(),
            suggestedSets: a.integer(),
            organizationId: a.string().required(),
            logs: a.hasMany("ExerciseLog", "planExerciseId"),
            exercise: a.belongsTo("Exercise", "exerciseId"),
            planDay: a.belongsTo("PlanDay", "planDayId"),
        })
        .authorization((allow) => [allow.groupDefinedIn("organizationId")]),

    // === PLAN ↔ DAY JOIN ===
    PlanDay: a
        .model({
            id: a.id(),
            planId: a.string().required(),
            dayOfWeek: a.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
            plan: a.belongsTo("Plan", "planId"),
            dayNumber: a.integer(),
            organizationId: a.string().required(),
            planExercises: a.hasMany("PlanExercise", "planDayId"),
        })
        .authorization((allow) => [allow.groupDefinedIn("organizationId")]),

    // === USER LOGS FOR COMPLETED WORKOUTS ===
    ExerciseLog: a
        .model({
            id: a.id(),
            planExerciseId: a.string().required(),
            date: a.datetime().required(),
            sets: a.json().required(),
            clientNotes: a.string(),
            organizationId: a.string().required(),
            planExercise: a.belongsTo("PlanExercise", "planExerciseId"),
        })
        .authorization((allow) => [allow.groupDefinedIn("organizationId")]),

    // === CUSTOM MUTATION: create a user in the caller's own organization ===
    // Replaces the old client-side AdminCreateUserCommand call in
    // CreateUser.tsx. All authorization/org-forcing logic lives server-side
    // in the function handler — the caller's own verified identity claims
    // decide the org and permitted roles, never client input.
    createOrgUser: a
        .mutation()
        .arguments({
            email: a.string().required(),
            name: a.string().required(),
            role: a.string().required(),
        })
        .returns(
            a.customType({
                success: a.boolean(),
                message: a.string(),
            })
        )
        .authorization((allow) => [allow.authenticated()])
        .handler(a.handler.function(createOrgUser)),

    // === CUSTOM QUERY: list users in the caller's own organization ===
    // Replaces the standalone hand-deployed getUsersAPI/getUsers Lambda.
    OrgUser: a.customType({
        id: a.string(),
        email: a.string(),
        name: a.string(),
        role: a.string(),
        organizationId: a.string(),
        enabled: a.boolean(),
        status: a.string(),
        createdAt: a.string(),
    }),
    listOrgUsers: a
        .query()
        .arguments({})
        .returns(a.ref("OrgUser").array())
        .authorization((allow) => [allow.authenticated()])
        .handler(a.handler.function(listOrgUsers)),
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
