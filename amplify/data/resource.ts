import {a, type ClientSchema, defineData} from "@aws-amplify/backend";
import {createOrgUser} from "../functions/createOrgUser/resource";
import {listOrgUsers} from "../functions/listOrgUsers/resource";
import {createOrganization} from "../functions/createOrganization/resource";

// Multi-tenant design (BTP-10): every org-scoped model carries an
// `organizationId` field whose value IS the name of a Cognito Group — every
// user belonging to an org (any role) is added to that group at creation.
// `allow.groupDefinedIn('organizationId')` means only members of that exact
// group can read/write the record — this is the real, server-enforced
// tenant boundary, not client-side UI gating.
//
// Role enforcement within an org (BTP-11): admin/trainer accounts are ALSO
// added to a second, per-org "staff" Cognito Group (`${organizationId}-staff`,
// created on first use by createOrgUser) — basic_user accounts are not.
// `Plan`/`PlanDay`/`PlanExercise`/`Exercise` therefore carry a `staffGroup`
// field (always `${organizationId}-staff`, set at creation) with two
// authorization rules: any org member can read, but only staff-group members
// get the (default, unrestricted) create/update/delete grant. Without this,
// any authenticated org member — including a basic_user/client — could
// write or delete any other member's plans/exercises.

const schema = a.schema({
    // === ORGANIZATIONS (tenants) ===
    // BTP-16: a member of the org itself can read their own Organization
    // record; `platform-admin` (the platform owner, currently just Ben —
    // deliberately NOT tied to any org's own `admin` role) has full access
    // across all of them, matching who's allowed to create one below.
    Organization: a
        .model({
            id: a.id(),
            name: a.string().required(),
            createdAt: a.datetime().required(),
        })
        .authorization((allow) => [
            allow.groupDefinedIn("id"),
            allow.group("platform-admin"),
        ]),

    // === CONTACT MESSAGES ===
    // Ungated by org — belongs to the single shared public marketing page,
    // not to any tenant. Public create (the contact form, via the identity
    // pool's guest/unauthenticated role — no API key involved), read/update
    // (mark read)/delete restricted to the static cross-org `platform-admin`
    // Cognito Group.
    ContactMessage: a
        .model({
            id: a.id(),
            name: a.string().required(),
            email: a.string().required(),
            message: a.string().required(),
            createdAt: a.datetime().required(),
            read: a.boolean().default(false),
        })
        .authorization((allow) => [
            allow.guest().to(["create"]),
            allow.group("platform-admin"),
        ]),

    // === PLANS ===
    Plan: a
        .model({
            id: a.id(),
            name: a.string().required(),
            trainerEmail: a.string().required(),
            clientEmail: a.string().required(),
            organizationId: a.string().required(),
            staffGroup: a.string().required(),
            planDays: a.hasMany("PlanDay", "planId"),
        })
        .authorization((allow) => [
            allow.groupDefinedIn("organizationId").to(["read"]),
            allow.groupDefinedIn("staffGroup"),
        ]),

    // === EXERCISE POOL (private per-organization) ===
    Exercise: a
        .model({
            id: a.id(),
            name: a.string().required(),
            type: a.enum(["LIFT", "RUN", "CYCLE", "INTERVAL", "KB_SWING"]),
            tips: a.string(),
            notes: a.string(),
            organizationId: a.string().required(),
            staffGroup: a.string().required(),
            planExercises: a.hasMany("PlanExercise", "exerciseId"),
        })
        .authorization((allow) => [
            allow.groupDefinedIn("organizationId").to(["read"]),
            allow.groupDefinedIn("staffGroup"),
        ]),

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
            staffGroup: a.string().required(),
            logs: a.hasMany("ExerciseLog", "planExerciseId"),
            exercise: a.belongsTo("Exercise", "exerciseId"),
            planDay: a.belongsTo("PlanDay", "planDayId"),
        })
        .authorization((allow) => [
            allow.groupDefinedIn("organizationId").to(["read"]),
            allow.groupDefinedIn("staffGroup"),
        ]),

    // === PLAN ↔ DAY JOIN ===
    PlanDay: a
        .model({
            id: a.id(),
            planId: a.string().required(),
            dayOfWeek: a.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
            plan: a.belongsTo("Plan", "planId"),
            dayNumber: a.integer(),
            organizationId: a.string().required(),
            staffGroup: a.string().required(),
            planExercises: a.hasMany("PlanExercise", "planDayId"),
        })
        .authorization((allow) => [
            allow.groupDefinedIn("organizationId").to(["read"]),
            allow.groupDefinedIn("staffGroup"),
        ]),

    // === USER LOGS FOR COMPLETED WORKOUTS ===
    // Deliberately NOT staff-restricted like the models above (BTP-11) —
    // clients need to create/update their OWN logs, which is an ownership
    // concern, not a role concern. Left on org-wide read/write for now;
    // scoping writes to the log's own client needs an owner field, tracked
    // as its own follow-up rather than folded in here.
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

    // === CUSTOM MUTATION: bootstrap a brand-new organization (BTP-16) ===
    // Creates the org's Cognito Group + staff Cognito Group + Organization
    // row + first admin user, all in one call — the same steps that were
    // previously done by hand via AWS CLI for every org so far. Restricted
    // to `platform-admin` here at the schema level (the platform owner,
    // deliberately separate from any org's own `admin` role) — this is the
    // only place that's allowed to mint a new tenant.
    // Named "provisionOrganization", not "createOrganization" — the
    // Organization a.model() above already auto-generates a createOrganization
    // CRUD mutation for the model itself, which this would otherwise collide
    // with.
    provisionOrganization: a
        .mutation()
        .arguments({
            orgId: a.string().required(),
            orgName: a.string().required(),
            adminEmail: a.string().required(),
            adminName: a.string().required(),
        })
        .returns(
            a.customType({
                success: a.boolean(),
                message: a.string(),
            })
        )
        .authorization((allow) => [allow.group("platform-admin")])
        .handler(a.handler.function(createOrganization)),
});

export type Schema = ClientSchema<typeof schema>;

// No apiKeyAuthorizationMode: nothing in the schema uses allow.publicApiKey()
// any more (BTP-1) — ContactMessage's public create goes through the guest
// (unauthenticated identity pool) role instead. Removing this also clears
// the stale AppSync::ApiKey resource that was permanently stuck in
// CloudFormation (physical key expired/deleted out-of-band months ago,
// causing every deploy's UPDATE on it to 404 and roll back the whole stack).
export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
    },
});
