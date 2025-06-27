import React from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.tsx";
import { client } from "../../graphql/graphqlClient.ts";
import { createExercise } from "../../graphql/mutations.ts";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { CreateExerciseMutation } from "../../graphql/types.ts";
import { ExerciseTypeEnum, ExerciseTypeMetadata } from "../../graphql/types.ts"

const CreateExercise: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [message, setMessage] = React.useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [type, setType] = React.useState<ExerciseTypeEnum>(ExerciseTypeEnum.LIFT);

    const [name, setName] = React.useState("");
    const [tips, setTips] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const togglePanel = () => setIsOpen(prev => !prev);

    const handleCreate = async () => {
        setLoading(true);
        setMessage(null);

        const input = { name, type, tips, notes };

        try {
            const response = (await client.graphql({
                query: createExercise,
                variables: { input },
            })) as GraphQLResult<CreateExerciseMutation>;

            const created = response.data?.createExercise;
            if (created) {
                setMessage(`✅ Created exercise: ${created.name}`);
                // Optionally clear the form
                setName("");
                setType(ExerciseTypeEnum.LIFT);
                setTips("");
                setNotes("");
            } else {
                setMessage("⚠️ Failed to create exercise.");
            }
        } catch (err: unknown) {
            console.error("Error creating exercise:", err);
            setMessage("❌ Error creating exercise.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.permissions?.createExercise) return null;

    return (
        <CollapsiblePanel title="Create Exercise" isOpen={isOpen} toggle={togglePanel}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
                <input
                    type="text"
                    value={name}
                    placeholder="Exercise Name"
                    onChange={(e) => setName(e.target.value)}
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ExerciseTypeEnum)}
                >
                    {ExerciseTypeMetadata.map(({ type, label }) => (
                        <option key={type} value={type}>
                            {label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={tips}
                    placeholder="Tips (optional)"
                    onChange={(e) => setTips(e.target.value)}
                />
                <textarea
                    value={notes}
                    placeholder="Notes (optional)"
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button onClick={handleCreate} disabled={loading}>
                    {loading ? "Creating..." : "Create Exercise"}
                </button>
                {message && <p>{message}</p>}
            </div>
        </CollapsiblePanel>
    );
};

export default CreateExercise;
