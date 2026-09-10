import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Loaded from .env.qa.json (repo root, gitignored) — written by
// scripts/qa/provision-qa-fixture.ts. Run that script first if this throws.
export interface QaFixture {
    password: string;
    platformAdmin: string;
    orgA: {
        id: string;
        admin: string;
        trainer: string;
        clientOwnedByTrainer: string;
        clientOwnedByAdmin: string;
    };
    orgB: {
        id: string;
        admin: string;
        client: string;
    };
}

const fixturePath = path.join(__dirname, "..", "..", ".env.qa.json");

export function loadQaFixture(): QaFixture {
    if (!fs.existsSync(fixturePath)) {
        throw new Error(
            `${fixturePath} not found. Run: npx tsx scripts/qa/provision-qa-fixture.ts`
        );
    }
    return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
}

export type Role =
    | "platform-admin"
    | "admin-a"
    | "trainer-a"
    | "client-a1"
    | "client-a2"
    | "admin-b"
    | "client-b1";

export function authStatePath(role: Role): string {
    return path.join(__dirname, "..", "..", "playwright", ".auth", `${role}.json`);
}

export function roleEmail(fixture: QaFixture, role: Role): string {
    switch (role) {
        case "platform-admin": return fixture.platformAdmin;
        case "admin-a": return fixture.orgA.admin;
        case "trainer-a": return fixture.orgA.trainer;
        case "client-a1": return fixture.orgA.clientOwnedByTrainer;
        case "client-a2": return fixture.orgA.clientOwnedByAdmin;
        case "admin-b": return fixture.orgB.admin;
        case "client-b1": return fixture.orgB.client;
    }
}
