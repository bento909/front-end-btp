// Resets the demo org's DATA back to the canonical baseline in demo-data.ts
// — deletes anything that doesn't match (stray exercises, extra/edited plan
// exercises, extra logs), fixes anything whose values drifted, and recreates
// anything missing. Does NOT touch the org/Cognito accounts themselves
// (there's no delete-Organization path in the app at all, so "restore" here
// means reconciling the data within the existing org, not recreating it).
//
// Run this any time the demo org has been poked around in and you want it
// back to a clean, predictable state to show someone.
//
// Usage: npx tsx scripts/qa/restore-demo-org.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Amplify } from "aws-amplify";
import { signIn, signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import {
    ORG_ID, STAFF_GROUP, ADMIN_EMAIL, TRAINER_EMAIL, CLIENT_EMAIL, PLAN_NAME,
    EXERCISE_DEFS, WEEK_DAYS, ASSIGNMENTS, LOGGED_ASSIGNMENT, LOGGED_SETS, LOGGED_NOTES, FIXED_PASSWORD,
} from "./demo-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputs = JSON.parse(fs.readFileSync(path.join(__dirname, "amplify_outputs.json"), "utf-8"));
Amplify.configure(outputs);
const dataClient = generateClient<Schema>({ authMode: "userPool" });

async function signInAs(email: string) {
    await signOut().catch(() => {});
    const { isSignedIn } = await signIn({ username: email, password: FIXED_PASSWORD });
    if (!isSignedIn) throw new Error(`Sign-in as ${email} failed`);
}

function check(msg: string) { console.log(`  = ${msg}`); }
function fix(msg: string) { console.log(`  ~ ${msg}`); }

async function main() {
    console.log("1. Reconciling exercises...");
    await signInAs(TRAINER_EMAIL);
    const allExercises = (await dataClient.models.Exercise.list({ filter: { organizationId: { eq: ORG_ID } } })).data;
    const exerciseIds: Record<string, string> = {};
    for (const def of EXERCISE_DEFS) {
        const existing = allExercises.find((e) => e.name === def.name);
        if (!existing) {
            const res = await dataClient.models.Exercise.create({
                name: def.name, type: def.type, tips: def.tips, notes: def.notes, organizationId: ORG_ID, staffGroup: STAFF_GROUP,
            });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            exerciseIds[def.name] = res.data!.id!;
            fix(`recreated missing exercise "${def.name}"`);
        } else {
            exerciseIds[def.name] = existing.id!;
            const driftedType = existing.type !== def.type;
            const driftedTips = (existing.tips ?? "") !== def.tips;
            const driftedNotes = (existing.notes ?? "") !== (def.notes ?? "");
            if (driftedType || driftedTips || driftedNotes) {
                await dataClient.models.Exercise.update({ id: existing.id!, type: def.type, tips: def.tips, notes: def.notes ?? "" });
                fix(`corrected drifted values on "${def.name}"`);
            } else {
                check(`"${def.name}" matches canonical`);
            }
        }
    }

    console.log("2. Reconciling the plan and its 7 days...");
    let planId: string;
    const existingPlan = (await dataClient.models.Plan.list({ filter: { clientEmail: { eq: CLIENT_EMAIL } } })).data[0];
    if (!existingPlan) {
        const res = await dataClient.models.Plan.create({ name: PLAN_NAME, trainerEmail: TRAINER_EMAIL, clientEmail: CLIENT_EMAIL, organizationId: ORG_ID, staffGroup: STAFF_GROUP });
        if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
        planId = res.data!.id!;
        fix("recreated missing plan");
    } else {
        planId = existingPlan.id!;
        if (existingPlan.name !== PLAN_NAME) {
            await dataClient.models.Plan.update({ id: planId, name: PLAN_NAME });
            fix("corrected plan name");
        } else {
            check("plan matches canonical");
        }
    }

    const dayIds: Record<string, string> = {};
    const existingDays = (await dataClient.models.PlanDay.list({ filter: { planId: { eq: planId } } })).data;
    for (const { day, num } of WEEK_DAYS) {
        const existing = existingDays.find((d) => d.dayOfWeek === day);
        if (!existing) {
            const res = await dataClient.models.PlanDay.create({ planId, dayOfWeek: day, dayNumber: num, organizationId: ORG_ID, staffGroup: STAFF_GROUP });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            dayIds[day] = res.data!.id!;
            fix(`recreated missing day ${day}`);
        } else {
            dayIds[day] = existing.id!;
        }
    }

    console.log("3. Reconciling each day's exercise assignments (deleting anything unexpected)...");
    let loggedExerciseId: string | null = null;
    for (const { day } of WEEK_DAYS) {
        const dayId = dayIds[day];
        const currentEntries = (await dataClient.models.PlanExercise.list({ filter: { planDayId: { eq: dayId } } })).data;
        const canonicalForDay = ASSIGNMENTS.filter((a) => a.day === day);

        // Delete anything on this day that isn't a canonical assignment.
        const canonicalExerciseIdsForDay = new Set(canonicalForDay.map((a) => exerciseIds[a.exercise]));
        for (const entry of currentEntries) {
            if (!canonicalExerciseIdsForDay.has(entry.exerciseId)) {
                await dataClient.models.PlanExercise.delete({ id: entry.id! });
                fix(`deleted unexpected exercise entry on ${day}`);
            }
        }

        // Ensure each canonical assignment exists with correct values.
        for (const [idx, a] of canonicalForDay.entries()) {
            const order = idx + 1;
            const match = currentEntries.find((e) => e.exerciseId === exerciseIds[a.exercise]);
            const isLogged = day === LOGGED_ASSIGNMENT.day && a.exercise === LOGGED_ASSIGNMENT.exercise;
            if (!match) {
                const res = await dataClient.models.PlanExercise.create({
                    planId, planDayId: dayId, exerciseId: exerciseIds[a.exercise], order,
                    suggestedReps: a.reps, suggestedWeight: a.weight, suggestedSets: a.sets, organizationId: ORG_ID, staffGroup: STAFF_GROUP,
                });
                if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
                if (isLogged) loggedExerciseId = res.data!.id!;
                fix(`recreated missing "${a.exercise}" on ${day}`);
            } else {
                if (isLogged) loggedExerciseId = match.id!;
                const drifted = match.order !== order || match.suggestedReps !== a.reps || match.suggestedWeight !== a.weight || match.suggestedSets !== a.sets;
                if (drifted) {
                    await dataClient.models.PlanExercise.update({ id: match.id!, order, suggestedReps: a.reps, suggestedWeight: a.weight, suggestedSets: a.sets });
                    fix(`corrected drifted values on "${a.exercise}" (${day})`);
                } else {
                    check(`"${a.exercise}" on ${day} matches canonical`);
                }
            }
        }
    }

    console.log("4. Deleting any non-canonical exercises left in the org...");
    const canonicalNames = new Set(EXERCISE_DEFS.map((d) => d.name));
    for (const ex of allExercises) {
        if (!canonicalNames.has(ex.name)) {
            await dataClient.models.Exercise.delete({ id: ex.id! });
            fix(`deleted stray exercise "${ex.name}"`);
        }
    }

    console.log("5. Reconciling the logged workout...");
    if (loggedExerciseId) {
        await signInAs(CLIENT_EMAIL);
        const allLogsInOrg = (await dataClient.models.ExerciseLog.list({ filter: { organizationId: { eq: ORG_ID } } })).data;
        const [canonicalLog, ...extraLogs] = allLogsInOrg.filter((l) => l.planExerciseId === loggedExerciseId);
        for (const stray of allLogsInOrg.filter((l) => l.planExerciseId !== loggedExerciseId)) {
            await dataClient.models.ExerciseLog.delete({ id: stray.id! });
            fix("deleted a log for a non-canonical exercise instance");
        }
        for (const extra of extraLogs) {
            await dataClient.models.ExerciseLog.delete({ id: extra.id! });
            fix("deleted a duplicate log on the canonical exercise instance");
        }
        const canonicalSetsJson = JSON.stringify(LOGGED_SETS);
        if (!canonicalLog) {
            const res = await dataClient.models.ExerciseLog.create({
                planExerciseId: loggedExerciseId, date: new Date().toISOString(), sets: canonicalSetsJson, clientNotes: LOGGED_NOTES, organizationId: ORG_ID,
            });
            if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join("; "));
            fix("recreated missing logged workout");
        } else if (canonicalLog.sets !== canonicalSetsJson || canonicalLog.clientNotes !== LOGGED_NOTES) {
            await dataClient.models.ExerciseLog.update({ id: canonicalLog.id!, sets: canonicalSetsJson, clientNotes: LOGGED_NOTES });
            fix("corrected drifted logged workout values");
        } else {
            check("logged workout matches canonical");
        }
    }

    await signOut().catch(() => {});
    console.log("\nDone — demo org restored to canonical baseline.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
