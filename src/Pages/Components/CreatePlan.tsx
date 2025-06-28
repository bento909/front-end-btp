import React from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store.tsx";
import {client} from "../../graphql/graphqlClient.ts"
import { createPlan } from "../../graphql/mutations.ts";
import {GraphQLResult} from "@aws-amplify/api-graphql";
import {CreateExerciseMutation} from "../../graphql/types.ts";

const CreatePlan: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [message, setMessage] = React.useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const togglePanel = () => setIsOpen((prev) => !prev);

    const handleCreate = async () => {
        const input = {
            name: "Hardcoded Squat",
            type: "LIFT",
            tips: "Keep your chest up.",
            notes: "Do 3 sets of 5 reps.",
        };

        try {
            const response = (await client.graphql({
                query: createPlan,
                variables: { input },
            })) as GraphQLResult<CreateExerciseMutation>;
            console.log("Created plan:", response.data.createExercise.name);
            setMessage("Plan created successfully!");
        } catch (err) {
            console.error("Error creating plan:", err);
            setMessage("Error creating plan.");
        }
    };

    return (!user || !user.permissions?.createPlan) ? null : (
        <CollapsiblePanel title="Create Exercise" isOpen={isOpen} toggle={togglePanel}>
            <button onClick={handleCreate}>Create New Plan</button>
            {message && <p>{message}</p>}
        </CollapsiblePanel>
    );
};

export default CreatePlan;
