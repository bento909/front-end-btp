// Checks the automation QA fixture (qa-fixture-a/b) for the data-state
// invariants the E2E suite relies on, and repairs anything that's drifted —
// most importantly, that Monday's exercise list for the trainer-owned client
// is empty. That invariant is easy to break by hand (someone signs in with
// the QA fixture credentials "just to have a look" and adds/edits an
// exercise, or a test run gets interrupted mid-flow) and, if it drifts, the
// "self-cleaning" exercise CRUD test starts failing in confusing ways rather
// than cleanly.
//
// Uses the dataClient directly (not a browser) — this is a data-integrity
// check, not a UI check, so there's no reason to pay Playwright's cost for it.
// Safe to run any time, including as a pre-flight before `npm run test:e2e`.
//
// Usage: npx tsx scripts/qa/verify-fixture.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Amplify } from "aws-amplify";
import { signIn, signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputs = JSON.parse(fs.readFileSync(path.join(__dirname, "amplify_outputs.json"), "utf-8"));
Amplify.configure(outputs);
const dataClient = generateClient<Schema>({ authMode: "userPool" });

const fixturePath = path.join(__dirname, "..", "..", ".env.qa.json");
if (!fs.existsSync(fixturePath)) {
    throw new Error(`${fixturePath} not found. Run: npx tsx scripts/qa/provision-qa-fixture.ts`);
}
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

const EXERCISE_NAME = "QA Automated Test Exercise";
let issuesFound = 0;
let issuesFixed = 0;

function report(ok: boolean, message: string) {
    console.log(`${ok ? "  OK " : "  ✗  "}${message}`);
    if (!ok) issuesFound++;
}

async function signInAs(email: string) {
    await signOut().catch(() => {});
    const { isSignedIn } = await signIn({ username: email, password: fixture.password });
    if (!isSignedIn) throw new Error(`Sign-in as ${email} failed`);
}

async function main() {
    console.log("Signing in as trainer A...");
    await signInAs(fixture.orgA.trainer);

    // 1. The shared test exercise exists.
    const exerciseRes = await dataClient.models.Exercise.list({
        filter: { name: { eq: EXERCISE_NAME }, organizationId: { eq: fixture.orgA.id } },
    });
    report(exerciseRes.data.length > 0, `Shared exercise "${EXERCISE_NAME}" exists in ${fixture.orgA.id}`);

    // 2. Client A1's Week Plan exists with all 7 days.
    const planRes = await dataClient.models.Plan.list({ filter: { clientEmail: { eq: fixture.orgA.clientOwnedByTrainer } } });
    const plan = planRes.data[0];
    report(!!plan, `Client A1's plan exists`);
    if (!plan) {
        console.log("  Cannot check further without a plan — run the E2E suite once to create it, or provision-qa-fixture.ts.");
    } else {
        const daysRes = await dataClient.models.PlanDay.list({ filter: { planId: { eq: plan.id! } } });
        report(daysRes.data.length === 7, `Client A1's plan has 7 days (found ${daysRes.data.length})`);

        // 3. Monday must be empty — the invariant the self-cleaning exercise
        // CRUD test depends on starting from.
        const monday = daysRes.data.find((d) => d.dayOfWeek === "MONDAY");
        if (monday) {
            const exercisesRes = await dataClient.models.PlanExercise.list({ filter: { planDayId: { eq: monday.id! } } });
            const strayCount = exercisesRes.data.length;
            const ok = strayCount === 0;
            report(ok, `Monday is empty for Client A1 (found ${strayCount} leftover exercise instance(s))`);
            if (!ok) {
                console.log(`  Repairing: deleting ${strayCount} stray exercise instance(s) from Monday...`);
                for (const ex of exercisesRes.data) {
                    await dataClient.models.PlanExercise.delete({ id: ex.id! });
                }
                issuesFixed++;
                console.log("  Repaired.");
            }
        } else {
            report(false, "Monday day record not found on Client A1's plan");
        }
    }

    // 4. Admin A2's custom 3-day plan exists (informational only — already
    // idempotent-safe in the E2E suite itself, no repair needed here).
    await signOut().catch(() => {});
    await signInAs(fixture.orgA.admin);
    const customPlanRes = await dataClient.models.Plan.list({ filter: { clientEmail: { eq: fixture.orgA.clientOwnedByAdmin } } });
    report(customPlanRes.data.length > 0, `Client A2's custom plan exists`);

    await signOut().catch(() => {});

    console.log(`\n${issuesFound === 0 ? "Fixture is clean." : `${issuesFound} issue(s) found, ${issuesFixed} repaired.`}`);
    if (issuesFound > issuesFixed) {
        console.log("Some issues need manual attention (see above) — not everything here is auto-repairable.");
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
