import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const SOURCE_URL = "https://democracy.wirral.gov.uk/mgMemberIndex.aspx?FN=WARD&VW=TABLE&PIC=1";

interface Councillor {
    name: string;
    email: string;
    party: string;
}

async function main() {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${SOURCE_URL}: HTTP ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const byWard = new Map<string, Councillor[]>();

    $("tr.mgTableOddRow, tr.mgTableEvenRow").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 4) return;

        const rawName = cells.eq(1).find('a[href^="mgUserInfo"]').first().text().trim();
        const name = rawName.replace(/^Councillor\s+/i, "").replace(/\s*-\s*/g, "-").trim();

        const email = cells.eq(1).find('a[href^="mailto:"]').first().text().trim().toLowerCase();
        const party = cells.eq(2).contents().first().text().trim();
        const ward = cells.eq(3).text().trim();

        if (!name || !email || !ward) return;

        const list = byWard.get(ward) ?? [];
        list.push({ name, email, party });
        byWard.set(ward, list);
    });

    const wardCount = byWard.size;
    const councillorCount = [...byWard.values()].reduce((sum, list) => sum + list.length, 0);

    if (wardCount === 0 || councillorCount === 0) {
        throw new Error(
            "Parsed zero councillors - democracy.wirral.gov.uk's HTML structure has probably changed. " +
            "Check the page manually and update the selectors in this script."
        );
    }

    console.log(`Parsed ${councillorCount} councillors across ${wardCount} wards from ${SOURCE_URL}`);

    const entries = [...byWard.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ward, councillors]) => {
            const rows = councillors
                .map(
                    (c) =>
                        `        { name: ${JSON.stringify(c.name)}, email: ${JSON.stringify(c.email)}, party: ${JSON.stringify(c.party)} },`
                )
                .join("\n");
            return `    ${JSON.stringify(ward)}: [\n${rows}\n    ],`;
        })
        .join("\n");

    const today = new Date().toISOString().slice(0, 10);

    const fileContents = `export interface Councillor {
    name: string;
    email: string;
    party: string;
}

// Scraped from ${SOURCE_URL} on ${today} by scripts/refresh-councillors.ts.
// Run \`npm run councillors:refresh\` to regenerate this file when the council's
// data changes (an "unknown ward" result on the Write to Your Councillor page
// is a sign it's gone stale - elections/by-elections change this list).
export const WIRRAL_COUNCILLORS_BY_WARD: Record<string, Councillor[]> = {
${entries}
};

const normalizeWardName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[.,]/g, " ")
        .replace(/\\band\\b/g, " ")
        .replace(/\\s+/g, " ")
        .trim();

const NORMALIZED_WARD_LOOKUP: Record<string, Councillor[]> = Object.fromEntries(
    Object.entries(WIRRAL_COUNCILLORS_BY_WARD).map(([ward, councillors]) => [normalizeWardName(ward), councillors])
);

export const findCouncillorsByWard = (wardName: string): Councillor[] | null =>
    NORMALIZED_WARD_LOOKUP[normalizeWardName(wardName)] ?? null;
`;

    const outPath = fileURLToPath(new URL("../src/data/wirralCouncillors.ts", import.meta.url));
    writeFileSync(outPath, fileContents, "utf-8");
    console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
