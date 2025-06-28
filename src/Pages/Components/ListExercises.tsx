import { useState } from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store.tsx";
import { client } from "../../graphql/graphqlClient.ts";
import { GraphQLQueries } from "../../graphql/queries.ts";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListExercisesQuery } from "../../graphql/types.ts";

const ListExercises: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isVisible, setIsVisible] = useState(false);
    const [exercises, setExercises] = useState<ListExercisesQuery["listExercises"]["items"]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleVisibility = () => {
        const show = !isVisible;
        setIsVisible(show);
        if (show && exercises.length === 0) {
            fetchExercises();
        }
    };

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = (await client.graphql({
                query: GraphQLQueries.listExercises,
            })) as GraphQLResult<ListExercisesQuery>;

            const items = response.data?.listExercises?.items ?? [];
            setExercises(items);
        } catch (err) {
            console.error("Failed to fetch exercises:", err);
            setError("Failed to load exercises.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.permissions?.createExercise) return null;

    return (
        <CollapsiblePanel title="Exercises" isOpen={isVisible} toggle={toggleVisibility}>
            {loading && <p>Loading exercises...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && exercises.length === 0 && <p>No exercises found.</p>}
            {!loading && exercises.length > 0 && (
                <ul>
                    {exercises.map((ex) => (
                        <li key={ex.id}>
                            <strong>{ex.name}</strong> ({ex.type})<br />
                            {ex.tips && <em>Tip:</em>} {ex.tips}<br />
                            {ex.notes && <em>Notes:</em>} {ex.notes}
                        </li>
                    ))}
                </ul>
            )}
        </CollapsiblePanel>
    );
};

export default ListExercises;
