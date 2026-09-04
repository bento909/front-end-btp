// Provisions a permanent QA fixture directly in PRODUCTION (not sandbox):
// one dedicated platform-admin test account, two organizations, and staff/
// client accounts in each, covering every role and every ownership edge case
// the E2E suite needs (BTP-10 cross-org isolation, BTP-11 role enforcement,
// BTP-12 createdBy ownership scoping).
//
// Deliberately targets `scripts/qa/amplify_outputs.json` (generated via
// `npx ampx generate outputs --app-id d276q2mvykjvwc --branch main --profile
// amplify-admin --out-dir ./scripts/qa`), NOT the repo-root amplify_outputs.json
// — that file tracks whatever sandbox was last used for local dev, which is a
// different Cognito pool/AppSync API entirely. Pointing this at the wrong one
// would silently "test" a sandbox while believing it was production (the
// exact class of bug BTP-16 hit with ListTables).
//
// Idempotent-ish: safe to re-run — existing users are left alone (only a
// fresh password is stamped), existing orgs fail loudly with an actionable
// message instead of silently reusing another org's data.
//
// Usage: npx tsx scripts/qa/provision-qa-fixture.ts
// Requires: AWS profile `amplify-admin` (or set AWS_PROFILE) for the Cognito
// admin API calls; everything else goes through the real app mutations
// (provisionOrganization, createOrgUser) as an authenticated user, exactly
// like a real trainer/admin would.

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputsPath = path.join(__dirname, "amplify_outputs.json");
if (!fs.existsSync(outputsPath)) {
    throw new Error(
        `${outputsPath} not found. Generate it first:\n` +
        `npx ampx generate outputs --app-id d276q2mvykjvwc --branch main --profile amplify-admin --out-dir ./scripts/qa`
    );
}
const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf-8"));

Amplify.configure(outputs);

const USER_POOL_ID: string = outputs.auth.user_pool_id;
const PROFILE = process.env.AWS_PROFILE ?? "amplify-admin";
const REGION: string = outputs.auth.aws_region;
const FIXED_PASSWORD = "QaFixture!2026Prod";
const EMAIL_PREFIX = "mathsmechanic+qa-"; // gmail plus-addressing: all routes to the real inbox

const cognito = new CognitoIdentityProviderClient({
    region: REGION,
    credentials: fromIni({ profile: PROFILE }),
});

const dataClient = generateClient<Schema>({ authMode: "userPool" });

async function ensureCognitoUser(email: string, name: string, extraAttributes: { Name: string; Value: string }[] = []) {
    try {
        await cognito.send(
            new AdminCreateUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: email,
                MessageAction: "SUPPRESS",
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "email_verified", Value: "true" },
                    { Name: "name", Value: name },
                    ...extraAttributes,
                ],
            })
        );
        console.log(`  created ${email}`);
    } catch (err) {
        if (!(err instanceof UsernameExistsException)) throw err;
        console.log(`  ${email} already exists`);
    }
    await cognito.send(
        new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            Password: FIXED_PASSWORD,
            Permanent: true,
        })
    );
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
        const staffGroup = `${orgId}-staff`;
        await ensureGroup(staffGroup);
        await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: email, GroupName: staffGroup }));
    }
}

async function ensurePlatformAdmin(email: string, name: string) {
    await ensureCognitoUser(email, name);
    await ensureGroup("platform-admin");
    await cognito.send(
        new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: email, GroupName: "platform-admin" })
    );
}

async function resetPassword(email: string) {
    await cognito.send(
        new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            Password: FIXED_PASSWORD,
            Permanent: true,
        })
    );
}

async function getUserSub(email: string): Promise<string> {
    const res = await cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: email }));
    const sub = res.UserAttributes?.find((a) => a.Name === "sub")?.Value;
    if (!sub) throw new Error(`Could not resolve "sub" for ${email}`);
    return sub;
}

async function signInAs(email: string) {
    await signOut().catch(() => {});
    const { isSignedIn, nextStep } = await signIn({ username: email, password: FIXED_PASSWORD });
    if (!isSignedIn) throw new Error(`Sign-in as ${email} did not complete: ${JSON.stringify(nextStep)}`);
}

// If provisionOrganization fails partway (its own bug, or anything else)
// after already creating the org's Cognito groups + DynamoDB row but before
// finishing the admin user, a naive retry would hit "already has a record"
// and wrongly assume the admin user exists too — resetPassword on a
// nonexistent user throws UserNotFoundException. Repair directly instead:
// ensure the Cognito user exists with the right attributes/groups, exactly
// what the mutation itself would have done.
async function provisionOrg(orgId: string, orgName: string, adminEmail: string, adminName: string) {
    const res = await dataClient.mutations.provisionOrganization({ orgId, orgName, adminEmail, adminName });
    if (res.errors?.length) {
        const msg = res.errors.map((e) => e.message).join("; ");
        if (msg.includes("already in use") || msg.includes("already has a record")) {
            console.log(`  org "${orgId}" already exists — ensuring its admin user is fully set up (repair path)`);
            await ensureCognitoUser(adminEmail, adminName, [
                { Name: "custom:organizationId", Value: orgId },
                { Name: "custom:role", Value: "admin" },
            ]);
            await joinOrgGroups(adminEmail, orgId, true);
            return;
        }
        throw new Error(`provisionOrganization(${orgId}) failed: ${msg}`);
    }
    if (!res.data?.success) throw new Error(`provisionOrganization(${orgId}) returned success=false: ${res.data?.message}`);
    console.log(`  ${res.data.message}`);
    await resetPassword(adminEmail);
}

async function createOrgUser(email: string, name: string, role: "admin" | "trainer" | "basic_user", orgId: string, createdBySub: string) {
    const res = await dataClient.mutations.createOrgUser({ email, name, role });
    if (res.errors?.length) {
        const msg = res.errors.map((e) => e.message).join("; ");
        console.log(`  createOrgUser(${email}) failed (${msg}) — repairing directly via Cognito admin API`);
        await ensureCognitoUser(email, name, [
            { Name: "custom:organizationId", Value: orgId },
            { Name: "custom:role", Value: role },
            { Name: "custom:createdBy", Value: createdBySub },
        ]);
        await joinOrgGroups(email, orgId, role === "admin" || role === "trainer");
        return;
    }
    if (!res.data?.success) throw new Error(`createOrgUser(${email}) returned success=false: ${res.data?.message}`);
    console.log(`  ${res.data.message}`);
    await resetPassword(email);
}

async function main() {
    const platformAdminEmail = `${EMAIL_PREFIX}platform-admin@gmail.com`;
    const adminAEmail = `${EMAIL_PREFIX}admin-a@gmail.com`;
    const trainerAEmail = `${EMAIL_PREFIX}trainer-a@gmail.com`;
    const clientA1Email = `${EMAIL_PREFIX}client-a1@gmail.com`; // owned by trainer A
    const clientA2Email = `${EMAIL_PREFIX}client-a2@gmail.com`; // owned by admin A
    const adminBEmail = `${EMAIL_PREFIX}admin-b@gmail.com`;
    const clientB1Email = `${EMAIL_PREFIX}client-b1@gmail.com`;

    console.log("1. Ensuring QA platform-admin account...");
    await ensurePlatformAdmin(platformAdminEmail, "QA Platform Admin");

    console.log("2. Signing in as QA platform-admin, provisioning org A...");
    await signInAs(platformAdminEmail);
    await provisionOrg("qa-fixture-a", "QA Fixture Org A", adminAEmail, "QA Admin A");

    console.log("3. Provisioning org B...");
    await provisionOrg("qa-fixture-b", "QA Fixture Org B", adminBEmail, "QA Admin B");

    console.log("4. Signing in as org A admin, creating trainer + a direct client...");
    await signInAs(adminAEmail);
    const adminASub = await getUserSub(adminAEmail);
    await createOrgUser(trainerAEmail, "QA Trainer A", "trainer", "qa-fixture-a", adminASub);
    await createOrgUser(clientA2Email, "QA Client A2 (owned by admin)", "basic_user", "qa-fixture-a", adminASub);

    console.log("5. Signing in as trainer A, creating their own client (BTP-12 ownership case)...");
    await signInAs(trainerAEmail);
    const trainerASub = await getUserSub(trainerAEmail);
    await createOrgUser(clientA1Email, "QA Client A1 (owned by trainer)", "basic_user", "qa-fixture-a", trainerASub);

    console.log("6. Signing in as org B admin, creating a client...");
    await signInAs(adminBEmail);
    const adminBSub = await getUserSub(adminBEmail);
    await createOrgUser(clientB1Email, "QA Client B1", "basic_user", "qa-fixture-b", adminBSub);

    await signOut().catch(() => {});

    const fixture = {
        note: "Permanent QA fixture in PRODUCTION. Password below is shared by every account.",
        password: FIXED_PASSWORD,
        platformAdmin: platformAdminEmail,
        orgA: {
            id: "qa-fixture-a",
            admin: adminAEmail,
            trainer: trainerAEmail,
            clientOwnedByTrainer: clientA1Email,
            clientOwnedByAdmin: clientA2Email,
        },
        orgB: {
            id: "qa-fixture-b",
            admin: adminBEmail,
            client: clientB1Email,
        },
    };
    const outPath = path.join(__dirname, "..", "..", ".env.qa.json");
    fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2));
    console.log(`\nDone. Fixture credentials written to ${outPath} (gitignored).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
