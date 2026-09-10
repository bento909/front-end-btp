import React, { FormEvent, useState } from "react";
import { Councillor } from "../data/wirralCouncillors.ts";
import { lookupCouncillorsByPostcode } from "../utils/councillorLookup.ts";
import { usePageMeta } from "../Hooks/usePageMeta.ts";
import { CIVIC_FAVICON } from "../utils/civicFavicon.ts";

type Status = "idle" | "loading" | "not-wirral" | "ward-not-found" | "error" | "done";

const buildBlankMailto = (councillors: Councillor[]): string => {
    const to = councillors.map((c) => c.email).join(",");
    return `mailto:${to}`;
};

const Councillors: React.FC = () => {
    usePageMeta("Email Your Councillors", CIVIC_FAVICON);
    const [postcode, setPostcode] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [wardName, setWardName] = useState<string | null>(null);
    const [councillors, setCouncillors] = useState<Councillor[]>([]);
    const [mailtoHref, setMailtoHref] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!postcode.trim()) return;

        setStatus("loading");
        const result = await lookupCouncillorsByPostcode(postcode);

        if (result.status !== "found") {
            if (result.status === "ward-not-found") setWardName(result.wardName);
            setStatus(result.status);
            return;
        }

        const href = buildBlankMailto(result.councillors);
        setWardName(result.ward);
        setCouncillors(result.councillors);
        setMailtoHref(href);
        setStatus("done");
        window.location.href = href;
    };

    return (
        <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "0 1.5rem", fontFamily: "sans-serif" }}>
            <h1>Email Your Councillors</h1>
            <p>
                Enter your postcode to find your three Wirral ward councillors and open a blank email addressed
                to them in your device's email app.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label htmlFor="postcode">Your postcode</label>
                    <input
                        id="postcode"
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. CH41 2XX"
                        required
                        style={{ padding: "8px" }}
                    />
                </div>

                <button type="submit" disabled={status === "loading"} style={{ padding: "10px 16px", alignSelf: "flex-start" }}>
                    {status === "loading" ? "Looking up your councillors..." : "Email my councillors"}
                </button>
            </form>

            {status === "not-wirral" && (
                <p style={{ marginTop: "1.5rem" }}>
                    That postcode doesn't look like it's in Wirral — this page only covers Wirral Council wards.
                </p>
            )}

            {status === "error" && (
                <p style={{ marginTop: "1.5rem" }}>
                    Sorry, that postcode couldn't be looked up. Double-check it and try again.
                </p>
            )}

            {status === "ward-not-found" && (
                <p style={{ marginTop: "1.5rem" }}>
                    Found your ward ({wardName}), but it's not in this page's councillor list — the list may be out
                    of date. You can look your councillor up directly at{" "}
                    <a href="https://democracy.wirral.gov.uk/mgFindMember.aspx" target="_blank" rel="noopener noreferrer">
                        democracy.wirral.gov.uk
                    </a>.
                </p>
            )}

            {status === "done" && (
                <div style={{ marginTop: "1.5rem" }}>
                    <p>
                        Your email app should have opened, addressed to your {wardName} ward councillors:
                    </p>
                    <ul>
                        {councillors.map((c) => (
                            <li key={c.email}>
                                {c.name} ({c.party}) — {c.email}
                            </li>
                        ))}
                    </ul>
                    {mailtoHref && (
                        <p>
                            Didn't open?{" "}
                            <a href={mailtoHref}>Click here to open the email</a>.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Councillors;
