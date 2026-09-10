import React, { FormEvent, useState } from "react";
import { Councillor } from "../data/wirralCouncillors.ts";
import { lookupCouncillorsByPostcode } from "../utils/councillorLookup.ts";
import letterTemplate from "../data/peakClusterLetterTemplate.txt?raw";
import { usePageMeta } from "../Hooks/usePageMeta.ts";
import { CIVIC_FAVICON } from "../utils/civicFavicon.ts";

type Status = "idle" | "loading" | "not-wirral" | "ward-not-found" | "error" | "done";

const buildMailto = (councillors: Councillor[], name: string, postcode: string): string => {
    const to = councillors.map((c) => c.email).join(",");
    const subject = "Message from a constituent";
    const body = letterTemplate.replace("{{name}}", name).replace("{{postcode}}", postcode);
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const CouncillorsPeakCluster: React.FC = () => {
    usePageMeta("Write to Your Councillor", CIVIC_FAVICON);
    const [name, setName] = useState("");
    const [postcode, setPostcode] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [wardName, setWardName] = useState<string | null>(null);
    const [councillors, setCouncillors] = useState<Councillor[]>([]);
    const [mailtoHref, setMailtoHref] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !postcode.trim()) return;

        setStatus("loading");
        const result = await lookupCouncillorsByPostcode(postcode);

        if (result.status !== "found") {
            if (result.status === "ward-not-found") setWardName(result.wardName);
            setStatus(result.status);
            return;
        }

        const href = buildMailto(result.councillors, name.trim(), result.postcode);
        setWardName(result.ward);
        setCouncillors(result.councillors);
        setMailtoHref(href);
        setStatus("done");
        window.location.href = href;
    };

    return (
        <div style={{ maxWidth: "600px", margin: "3rem auto", padding: "0 1.5rem", fontFamily: "sans-serif" }}>
            <h1>Write to Your Councillor</h1>
            <p>
                Enter your name and postcode to find your three Wirral ward councillors and open a pre-filled
                email to them in your device's email app.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label htmlFor="name">Your name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: "8px" }}
                    />
                </div>

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
                    {status === "loading" ? "Looking up your councillors..." : "Find my councillors & open email"}
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

export default CouncillorsPeakCluster;
