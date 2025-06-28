import { useState } from "react";
import CollapsiblePanel from "../../Styles/CollapsiblePanel";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchExercisesThunk } from "../../redux/exercisesSlice";
import {ExerciseTypeEnum, ExerciseTypeMetadata} from "../../graphql/types.ts";

const ListExercises: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const { exercises, loading, error } = useSelector((state: RootState) => state.exercises);
    const dispatch = useDispatch<AppDispatch>();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        const show = !isVisible;
        setIsVisible(show);
        if (show && exercises.length === 0) {
            dispatch(fetchExercisesThunk());
        }
    };

    const getExerciseTypeLabel = (type: ExerciseTypeEnum): string => {
        const match = ExerciseTypeMetadata.find((item) => item.type === type);
        return match ? match.label : type; // Fallback to the raw type if not found
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
                            <strong>{ex.name}</strong>
                            {ex.type && ` (${getExerciseTypeLabel(ex.type)})`} <br />
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
