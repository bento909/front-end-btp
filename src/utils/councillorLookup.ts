import { Councillor, findCouncillorsByWard } from "../data/wirralCouncillors.ts";

export type CouncillorLookupResult =
    | { status: "not-wirral" }
    | { status: "ward-not-found"; wardName: string }
    | { status: "error" }
    | { status: "found"; ward: string; postcode: string; councillors: Councillor[] };

export async function lookupCouncillorsByPostcode(postcode: string): Promise<CouncillorLookupResult> {
    try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
        if (!res.ok) return { status: "error" };

        const data = await res.json();
        const result = data.result;
        if (!result) return { status: "error" };

        if (!String(result.admin_district).toLowerCase().includes("wirral")) {
            return { status: "not-wirral" };
        }

        const councillors = findCouncillorsByWard(result.admin_ward);
        if (!councillors) {
            return { status: "ward-not-found", wardName: result.admin_ward };
        }

        return { status: "found", ward: result.admin_ward, postcode: result.postcode, councillors };
    } catch {
        return { status: "error" };
    }
}
