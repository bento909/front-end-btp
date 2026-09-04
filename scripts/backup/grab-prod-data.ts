// Exports every row of every org-scoped DynamoDB table, plus every Cognito
// user/group/membership, from PRODUCTION to a timestamped local directory —
// a portable, human-readable snapshot. Built for the "kill the app, take the
// data, reprovision somewhere else" scenario, not as a substitute for
// DynamoDB's own Point-in-Time Recovery (which is same-account,
// same-engine, restores into a new table — a different job entirely; worth
// enabling separately, unrelated to this).
//
// Read-only — never writes to production. Safe to run any time.
//
// Cognito passwords can never be exported (Cognito doesn't expose them to
// anyone, including account admins) — restoring a recreated user always
// means a temporary password + forced reset. Not a limitation of this
// script; a hard limit of Cognito itself.
//
// Usage: npx tsx scripts/backup/grab-prod-data.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    ListGroupsCommand,
    AdminListGroupsForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromIni } from "@aws-sdk/credential-providers";
import { makeCfnClient, findAllTableNames } from "./find-tables";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGION = "eu-north-1";
const PROFILE = process.env.AWS_PROFILE ?? "amplify-admin";
const USER_POOL_ID = "eu-north-1_U4svAZJEw"; // production pool — confirmed against the auth stack's own resource, not guessed

async function scanTable(ddb: DynamoDBClient, tableName: string): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    let lastKey: Record<string, any> | undefined;
    do {
        const res = await ddb.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey: lastKey }));
        items.push(...(res.Items ?? []).map((i) => unmarshall(i)));
        lastKey = res.LastEvaluatedKey;
    } while (lastKey);
    return items;
}

async function main() {
    const cfn = makeCfnClient(REGION, PROFILE);
    const ddb = new DynamoDBClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });
    const cognito = new CognitoIdentityProviderClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });

    console.log("Resolving table names for this deployment...");
    const tableNames = await findAllTableNames(cfn);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outDir = path.join(__dirname, "snapshots", timestamp);
    fs.mkdirSync(outDir, { recursive: true });

    for (const [model, tableName] of Object.entries(tableNames)) {
        console.log(`Scanning ${model} (${tableName})...`);
        const items = await scanTable(ddb, tableName);
        fs.writeFileSync(path.join(outDir, `${model}.json`), JSON.stringify(items, null, 2));
        console.log(`  ${items.length} item(s)`);
    }

    console.log("Exporting Cognito users (attributes + group memberships, never passwords)...");
    const users: { username: string; attributes: Record<string, string>; enabled: boolean; status: string; groups: string[] }[] = [];
    let paginationToken: string | undefined;
    do {
        const res = await cognito.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID, PaginationToken: paginationToken }));
        for (const u of res.Users ?? []) {
            const groupsRes = await cognito.send(new AdminListGroupsForUserCommand({ UserPoolId: USER_POOL_ID, Username: u.Username! }));
            users.push({
                username: u.Username!,
                attributes: Object.fromEntries((u.Attributes ?? []).map((a) => [a.Name!, a.Value ?? ""])),
                enabled: u.Enabled ?? true,
                status: u.UserStatus ?? "",
                groups: (groupsRes.Groups ?? []).map((g) => g.GroupName!),
            });
        }
        paginationToken = res.PaginationToken;
    } while (paginationToken);

    const groups: string[] = [];
    let groupsToken: string | undefined;
    do {
        const res = await cognito.send(new ListGroupsCommand({ UserPoolId: USER_POOL_ID, NextToken: groupsToken }));
        groups.push(...(res.Groups ?? []).map((g) => g.GroupName!));
        groupsToken = res.NextToken;
    } while (groupsToken);

    fs.writeFileSync(path.join(outDir, "CognitoUsers.json"), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(outDir, "CognitoGroups.json"), JSON.stringify(groups, null, 2));
    console.log(`  ${users.length} user(s), ${groups.length} group(s)`);

    fs.writeFileSync(path.join(__dirname, "snapshots", "latest.json"), JSON.stringify({ snapshot: timestamp }, null, 2));

    console.log(`\nDone. Snapshot written to ${outDir}`);
    console.log("Contains real PII (names, emails, workout notes) — stays local, gitignored. Never commit it.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
