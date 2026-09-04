import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store.tsx";
import { canCreateOrganization } from "../../../../Constants/constants.tsx";
import CollapsiblePanel from "../../../../Styles/CollapsiblePanel.tsx";
import { dataClient } from "../../../../graphql/dataClient.ts";

// Bootstraps a brand-new organization (BTP-16) — Cognito Group, staff
// Cognito Group, Organization row, and its first admin user, all via the
// createOrganization mutation (amplify/functions/createOrganization).
// Restricted server-side to the platform-admin group; canCreateOrganization
// here is just the matching UI gate, not the real enforcement.
const CreateOrganization: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isOpen, setIsOpen] = useState(false);
    const [orgId, setOrgId] = useState("");
    const [orgName, setOrgName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminName, setAdminName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    if (!user || !canCreateOrganization(user)) return null;

    const handleCreate = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await dataClient.mutations.provisionOrganization({
                orgId, orgName, adminEmail, adminName,
            });
            if (response.errors?.length) throw new Error(response.errors.map((e) => e.message).join("; "));
            if (!response.data?.success) throw new Error(response.data?.message || "Organization creation failed");

            setMessage(response.data.message || "Organization created.");
            setOrgId("");
            setOrgName("");
            setAdminEmail("");
            setAdminName("");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Error creating organization.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CollapsiblePanel title="Create Organization" isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                    type="text"
                    value={orgId}
                    placeholder="Org id (lowercase, numbers, hyphens — e.g. some-gym)"
                    onChange={(e) => setOrgId(e.target.value)}
                />
                <input
                    type="text"
                    value={orgName}
                    placeholder="Org display name"
                    onChange={(e) => setOrgName(e.target.value)}
                />
                <input
                    type="email"
                    value={adminEmail}
                    placeholder="First admin's email"
                    onChange={(e) => setAdminEmail(e.target.value)}
                />
                <input
                    type="text"
                    value={adminName}
                    placeholder="First admin's name"
                    onChange={(e) => setAdminName(e.target.value)}
                />
                <button onClick={handleCreate} disabled={loading || !orgId || !orgName || !adminEmail || !adminName}>
                    {loading ? "Creating..." : "Create Organization"}
                </button>
                {message && <p>{message}</p>}
            </div>
        </CollapsiblePanel>
    );
};

export default CreateOrganization;
