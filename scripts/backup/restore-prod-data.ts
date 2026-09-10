// Restores a snapshot grabbed by grab-prod-data.ts into PRODUCTION.
//
// Mode: MERGE/OVERWRITE, never delete. Every row in the snapshot is written
// (overwriting any row that already exists with the same id) — but nothing
// present now that ISN'T in the snapshot is ever removed. This is a
// deliberate choice for the "reprovision somewhere else and reload the
// data" use case: safer than a full wipe-and-replace if this is ever run
// against a target that already has other real data on it.
//
// Cognito users that no longer exist are recreated with a random temporary
// password (Cognito never exposes real passwords to export/restore, to
// anyone, including account admins) — they'll need to reset it on first
// sign-in. Existing users have their attributes synced but keep their real
// password untouched.
//
// Requires --yes to actually run (writes directly to production) — without
// it, prints what it WOULD do and exits.
//
// Usage:
//   npx tsx scripts/backup/restore-prod-data.ts              # dry-run, most recent snapshot
//   npx tsx scripts/backup/restore-prod-data.ts --yes         # restore, most recent snapshot
//   npx tsx scripts/backup/restore-prod-data.ts 2026-09-04T12-00-00-000Z --yes   # restore a specific snapshot

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminUpdateUserAttributesCommand,
    AdminAddUserToGroupCommand,
    AdminGetUserCommand,
    CreateGroupCommand,
    GroupExistsException,
    ResourceNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromIni } from "@aws-sdk/credential-providers";
import { makeCfnClient, findAllTableNames } from "./find-tables";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGION = "eu-north-1";
const PROFILE = process.env.AWS_PROFILE ?? "amplify-admin";
const USER_POOL_ID = "eu-north-1_U4svAZJEw";

// Same guaranteed-category-coverage generator as the app's own Lambda
// handlers (BTP-20) — picking chars uniformly at random can fail Cognito's
// password policy roughly 1 in 6 times.
function randomTempPassword(): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%^&*";
    const all = upper + lower + digits + symbols;
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
    const rest = Array.from({ length: 16 }, () => all[Math.floor(Math.random() * all.length)]);
    return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

async function main() {
    const args = process.argv.slice(2);
    const confirmed = args.includes("--yes") || args.includes("-y");
    const snapshotArg = args.find((a) => !a.startsWith("-"));

    const snapshotsDir = path.join(__dirname, "snapshots");
    const snapshotName = snapshotArg ?? (JSON.parse(fs.readFileSync(path.join(snapshotsDir, "latest.json"), "utf-8")).snapshot as string);
    const snapshotDir = path.join(snapshotsDir, snapshotName);
    if (!fs.existsSync(snapshotDir)) throw new Error(`Snapshot not found: ${snapshotDir}`);

    console.log(`Snapshot: ${snapshotDir}`);
    console.log("Mode: MERGE/OVERWRITE — writes every row in the snapshot (overwriting matching ids); deletes nothing.\n");

    if (!confirmed) {
        console.log("Dry run (no --yes passed) — nothing written. To actually restore into PRODUCTION:");
        console.log(`  npx tsx scripts/backup/restore-prod-data.ts ${snapshotArg ?? snapshotName} --yes`);
        return;
    }

    const cfn = makeCfnClient(REGION, PROFILE);
    const ddb = new DynamoDBClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });
    const cognito = new CognitoIdentityProviderClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });

    console.log("Resolving current table names for this deployment...");
    const tableNames = await findAllTableNames(cfn);

    for (const [model, tableName] of Object.entries(tableNames)) {
        const filePath = path.join(snapshotDir, `${model}.json`);
        if (!fs.existsSync(filePath)) {
            console.log(`  (no snapshot file for ${model}, skipping)`);
            continue;
        }
        const items: Record<string, unknown>[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        console.log(`Restoring ${model} (${items.length} item(s)) into ${tableName}...`);
        for (const item of items) {
            await ddb.send(new PutItemCommand({ TableName: tableName, Item: marshall(item, { removeUndefinedValues: true }) }));
        }
    }

    console.log("Restoring Cognito groups...");
    const groups: string[] = JSON.parse(fs.readFileSync(path.join(snapshotDir, "CognitoGroups.json"), "utf-8"));
    for (const g of groups) {
        try {
            await cognito.send(new CreateGroupCommand({ UserPoolId: USER_POOL_ID, GroupName: g }));
        } catch (err) {
            if (!(err instanceof GroupExistsException)) throw err;
        }
    }

    console.log("Restoring Cognito users...");
    const users: { username: string; attributes: Record<string, string>; groups: string[] }[] = JSON.parse(
        fs.readFileSync(path.join(snapshotDir, "CognitoUsers.json"), "utf-8")
    );
    let recreatedCount = 0;
    for (const u of users) {
        const attrList = Object.entries(u.attributes)
            .filter(([name]) => name !== "sub") // server-assigned, can't be set
            .map(([Name, Value]) => ({ Name, Value }));

        let exists = true;
        try {
            await cognito.send(new AdminGetUserCommand({ UserPoolId: USER_POOL_ID, Username: u.username }));
        } catch (err) {
            if (err instanceof ResourceNotFoundException) exists = false;
            else throw err;
        }

        if (!exists) {
            // Full attribute set, custom attributes included — only valid at
            // creation time.
            await cognito.send(
                new AdminCreateUserCommand({
                    UserPoolId: USER_POOL_ID,
                    Username: u.username,
                    MessageAction: "SUPPRESS",
                    TemporaryPassword: randomTempPassword(),
                    UserAttributes: attrList,
                })
            );
            recreatedCount++;
            console.log(`  recreated ${u.username} (temporary password — must be reset on first sign-in)`);
        } else {
            // custom:organizationId/role/createdBy are declared immutable in
            // amplify/auth/resource.ts (deliberate — a compromised account
            // shouldn't be able to reassign its own org/role) — Cognito
            // rejects AdminUpdateUserAttributes on them outright, even for an
            // existing user whose value already matches. Since they're
            // immutable, an existing user's values can never have drifted
            // anyway; only sync the genuinely mutable standard attributes.
            const mutableAttrs = attrList.filter((a) => a.Name === "name");
            if (mutableAttrs.length > 0) {
                await cognito.send(new AdminUpdateUserAttributesCommand({ UserPoolId: USER_POOL_ID, Username: u.username, UserAttributes: mutableAttrs }));
            }
        }
        for (const g of u.groups) {
            await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId: USER_POOL_ID, Username: u.username, GroupName: g }));
        }
    }

    console.log(`\nDone. Restore complete (merge/overwrite — nothing was deleted).`);
    if (recreatedCount > 0) {
        console.log(`${recreatedCount} user(s) had to be recreated with a temporary password and must reset it on next sign-in.`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
