// Provisions a THIRD organization, separate from the automation fixture
// (qa-fixture-a/b) — a "look around with real-looking data in place" org for
// manual inspection. Deliberately kept apart from the E2E suite's fixture so
// nobody is tempted to poke at the automation data directly (which would
// break the invariants the tests rely on, particularly that Monday's
// exercise list for the trainer-owned QA client starts empty).
//
// This script only ever CREATES what's missing — it never deletes or fixes
// drifted data. If you've been poking around in the demo org and want it
// back to a clean baseline, use restore-demo-org.ts instead.
//
// Canonical data lives in demo-data.ts, shared with restore-demo-org.ts.
//
// Usage: npx tsx scripts/qa/provision-demo-org.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Amplify } from "aws-amplify";
import { signIn, signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
    AdminGetUserCommand,
    CreateGroupCommand,
    GroupExistsException,
    UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromIni } from "@aws-sdk/credential-providers";
import type { Schema } from "../../amplify/data/resource";
import {
    ORG_ID, ORG_NAME, FIXED_PASSWORD, STAFF_GROUP,
    PLATFORM_ADMIN_EMAIL, ADMIN_EMAIL, TRAINER_EMAIL, CLIENT_EMAIL,
    PLAN_NAME, EXERCISE_DEFS, WEEK_DAYS, ASSIGNMENTS, LOGGED_ASSIGNMENT, LOGGED_SETS, LOGGED_NOTES,
} from "./demo-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputs = JSON.parse(fs.readFileSync(path.join(__dirname, "amplify_outputs.json"), "utf-8"));
Amplify.configure(outputs);

const USER_POOL_ID: string = outputs.auth.user_pool_id;
const PROFILE = process.env.AWS_PROFILE ?? "amplify-admin";
const REGION: string = outputs.auth.aws_region;

const cognito = new CognitoIdentityProviderClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });
const dataClient = generateClient<Schema>({ authMode: "userPool" });

async function ensureCognitoUser(email: string, name: string, extraAttributes: { Name: string; Value: string }[] = []) {
    try {
        await cognito.send(new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID, Username: email, MessageAction: "SUPPRESS",
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "email_verified", Value: "true" },
                { Name: "name", Value: name },
                ...extraAttributes,
            ],
        }));
        console.log(`  created ${email}`);
    } catch (err) {
        if (!(err instanceof UsernameExistsException)) throw err;
        console.log(`  ${email} already exists`);
    }
    await cognito.send(new AdminSetUserPasswordCommand({ UserPoolId: USER_POOL_ID, Username: email, Password: FIXED_PASSWORD, Permanent: true }));
}

async function ensureGroup(name: string) {
    try {
        await cognito.send(new CreateGroupCommand({ UserPoolId: USER_POOL_ID, GroupName: name }));
    } catch (err) {
        if (!(err instanceof GroupExistsException)) throw err;
    }
}

async function joinOrgGroups(email: string, orgId: string, isStaff: boolean) {
    await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: email, GroupName: orgId }));
    if (isStaff) {
        await ensureGroup(`${orgId}-staff`);
        await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: email, GroupName: `${orgId}-staff` }));
    }
}

async function getUserSub(email: string): Promise<string> {
    const res = await cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email }));
    const sub = res.UserAttributes?.find((a) => a.Name === "sub")?.Value;
    if (!sub) throw new Error(`Could not resolve "sub" for ${email}`);
    return sub;
}

async function signInAs(email: string) {
    await signOut().catch(() => {});
    const { isSignedIn } = await signIn({ username: email, password: FIXED_PASSWORD });
    if (!isSignedIn) throw new Error(`Sign-in as ${email} failed`);
}

async function main() {
    console.log("1. Ensuring a platform-admin account to provision the org with...");
    await ensureCognitoUser(PLATFORM_ADMIN_EMAIL, "Demo Platform Admin");
    await ensureGroup("platform-admin");
    await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: PLATFORM_ADMIN_EMAIL, GroupName: "platform-admin" }));

    console.log("2. Provisioning the demo org...");
    await signInAs(PLATFORM_ADMIN_EMAIL);
    const orgRes = await dataClient.mutations.provisionOrganization({ orgId: ORG_ID, orgName: ORG_NAME, adminEmail: ADMIN_EMAIL, adminName: "Demo Admin" });
    if (orgRes.errors?.length && !orgRes.errors.some((e) => e.message.includes("already"))) {
        throw new Error(orgRes.errors.map((e) => e.message).join("; "));
    }
    await ensureCognitoUser(ADMIN_EMAIL, "Demo Admin", [
        { Name: "custom:organizationId", Value: ORG_ID },
        { Name: "custom:role", Value: "admin" },
    ]);
    await joinOrgGroups(ADMIN_EMAIL, ORG_ID, true);

    console.log("3. Creating trainer + client...");
    await signInAs(ADMIN_EMAIL);
    const adminSub = await getUserSub(ADMIN_EMAIL);
    const trainerRes = await dataClient.mutations.createOrgUser({ email: TRAINER_EMAIL, name: "Demo Trainer", role: "trainer" });
    if (trainerRes.errors?.length) {
        await ensureCognitoUser(TRAINER_EMAIL, "Demo Trainer", [
            { Name: "custom:organizationId", Value: ORG_ID }, { Name: "custom:role", Value: "trainer" }, { Name: "custom:createdBy", Value: adminSub },
        ]);
        await joinOrgGroups(TRAINER_EMAIL, ORG_ID, true);
    } else {
        await cognito.send(new AdminSetUserPasswordCommand({ UserPoolId: USER_POOL_ID, Username: TRAINER_EMAIL, Password: FIXED_PASSWORD, Permanent: true }));
    }

    await signInAs(TRAINER_EMAIL);
    const trainerSub = await getUserSub(TRAINER_EMAIL);
    const clientRes = await dataClient.mutations.createOrgUser({ email: CLIENT_EMAIL, name: "Demo Client", role: "basic_user" });
    if (clientRes.errors?.length) {
        await ensureCognitoUser(CLIENT_EMAIL, "Demo Client", [
            { Name: "custom:organizationId", Value: ORG_ID }, { Name: "custom:role", Value: "basic_user" }, { Name: "custom:createdBy", Value: trainerSub },
        ]);
        await joinOrgGroups(CLIENT_EMAIL, ORG_ID, false);
    } else {
        await cognito.send(new AdminSetUserPasswordCommand({ UserPoolId: USER_POOL_ID, Username: CLIENT_EMAIL, Password: FIXED_PASSWORD, Permanent: true }));
    }

    console.log("4. Creating exercises (idempotent — skips ones that already exist)...");
    const exerciseIds: Record<string, string> = {};
    for (const def of EXERCISE_DEFS) {
        const existing = await dataClient.models.Exercise.list({ filter: { name: { eq: def.name }, organizationId: { eq: ORG_ID } } });
        if (existing.data.length > 0) {
            exerciseIds[def.name] = existing.data[0].id!;
            console.log(`  ${def.name} already exists`);
            continue;
        }
        const res = await dataClient.models.Exercise.create({
            name: def.name, type: def.type, tips: def.tips, notes: def.notes,
            organizationId: ORG_ID, staffGroup: STAFF_GROUP,
        });
        if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
        exerciseIds[def.name] = res.data!.id!;
        console.log(`  created ${def.name}`);
    }

    console.log("5. Creating a week plan for the client (idempotent)...");
    let planId: string;
    const existingPlan = await dataClient.models.Plan.list({ filter: { clientEmail: { eq: CLIENT_EMAIL } } });
    if (existingPlan.data.length > 0) {
        planId = existingPlan.data[0].id!;
        console.log("  plan already exists");
    } else {
        const planRes = await dataClient.models.Plan.create({
            name: PLAN_NAME, trainerEmail: TRAINER_EMAIL, clientEmail: CLIENT_EMAIL, organizationId: ORG_ID, staffGroup: STAFF_GROUP,
        });
        if (planRes.errors?.length) throw new Error(planRes.errors.map((e) => e.message).join("; "));
        planId = planRes.data!.id!;
        console.log("  created plan");
    }

    const dayIds: Record<string, string> = {};
    const existingDays = await dataClient.models.PlanDay.list({ filter: { planId: { eq: planId } } });
    if (existingDays.data.length === 7) {
        for (const d of existingDays.data) dayIds[d.dayOfWeek!] = d.id!;
        console.log("  7 days already exist");
    } else {
        for (const { day, num } of WEEK_DAYS) {
            const res = await dataClient.models.PlanDay.create({
                planId, dayOfWeek: day, dayNumber: num, organizationId: ORG_ID, staffGroup: STAFF_GROUP,
            });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            dayIds[day!] = res.data!.id!;
        }
        console.log("  created 7 days");
    }

    console.log("6. Assigning exercises to Monday/Wednesday/Friday/Saturday, leaving rest days empty (idempotent)...");
    let loggedExerciseId: string | null = null;
    for (const [i, a] of ASSIGNMENTS.entries()) {
        const dayId = dayIds[a.day];
        const existing = await dataClient.models.PlanExercise.list({ filter: { planDayId: { eq: dayId }, exerciseId: { eq: exerciseIds[a.exercise] } } });
        const isLogged = a.day === LOGGED_ASSIGNMENT.day && a.exercise === LOGGED_ASSIGNMENT.exercise;
        if (existing.data.length > 0) {
            if (isLogged) loggedExerciseId = existing.data[0].id!;
            continue;
        }
        const order = ASSIGNMENTS.filter((x, j) => x.day === a.day && j <= i).length;
        const res = await dataClient.models.PlanExercise.create({
            planId, planDayId: dayId, exerciseId: exerciseIds[a.exercise], order,
            suggestedReps: a.reps, suggestedWeight: a.weight, suggestedSets: a.sets,
            organizationId: ORG_ID, staffGroup: STAFF_GROUP,
        });
        if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
        if (isLogged) loggedExerciseId = res.data!.id!;
    }
    console.log("  done");

    console.log("7. Logging one completed workout as the client...");
    if (loggedExerciseId) {
        await signInAs(CLIENT_EMAIL);
        const existingLog = await dataClient.models.ExerciseLog.list({ filter: { planExerciseId: { eq: loggedExerciseId } } });
        if (existingLog.data.length > 0) {
            console.log("  already logged");
        } else {
            const res = await dataClient.models.ExerciseLog.create({
                planExerciseId: loggedExerciseId,
                date: new Date().toISOString(),
                sets: JSON.stringify(LOGGED_SETS),
                clientNotes: LOGGED_NOTES,
                organizationId: ORG_ID,
            });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            console.log("  logged");
        }
    }

    await signOut().catch(() => {});

    const summary = {
        note: "Human-browsable demo org in PRODUCTION, separate from the automation QA fixture (.env.qa.json). Feel free to poke around — this data isn't relied on by any test. Run restore-demo-org.ts to reset it back to this baseline.",
        password: FIXED_PASSWORD,
        orgId: ORG_ID,
        admin: ADMIN_EMAIL,
        trainer: TRAINER_EMAIL,
        client: CLIENT_EMAIL,
    };
    fs.writeFileSync(path.join(__dirname, "..", "..", ".env.demo.json"), JSON.stringify(summary, null, 2));
    console.log("\nDone. Credentials written to .env.demo.json (gitignored).");
    console.log(`Sign in at https://main.d276q2mvykjvwc.amplifyapp.com/app/home as any of the emails above, password: ${FIXED_PASSWORD}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
