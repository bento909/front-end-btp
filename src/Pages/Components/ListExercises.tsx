import {useState} from "react";
import CollapsiblePanel, {Button} from "../../Styles/CollapsiblePanel";
import {useDispatch, useSelector} from "react-redux";
import {RootState, AppDispatch} from "../../redux/store";
import {fetchExercisesThunk} from "../../redux/exercisesSlice";
import {ExerciseTypeEnum, ExerciseTypeMetadata} from "../../graphql/types";

const ListExercises: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const {exercises, loading, error} = useSelector((state: RootState) => state.exercises);
    const dispatch = useDispatch<AppDispatch>();
    const [isVisible, setIsVisible] = useState(false);

    // Track which exercise panels are expanded
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleVisibility = () => {
        const show = !isVisible;
        setIsVisible(show);
        if (show && exercises.length === 0) {
            dispatch(fetchExercisesThunk());
        }
    };

    const toggleExercise = (id: string) => {
        setExpandedIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    const getExerciseTypeLabel = (type: ExerciseTypeEnum): string => {
        const match = ExerciseTypeMetadata.find((item) => item.type === type);
        return match ? match.label : type;
    };

    if (!user || !user.permissions?.createExercise) return null;

    return (
        <CollapsiblePanel title="List Exercises" isOpen={isVisible} toggle={toggleVisibility}>
            {loading && <p>Loading exercises...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}
            {!loading && exercises.length === 0 && <p>No exercises found.</p>}
            {!loading && exercises.length > 0 && (
                <ul>
                    {exercises.map((ex) => {
                        const isOpen = expandedIds.has(ex.id);
                        return (
                            <li key={ex.id}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: isOpen ? "4px" : "0", // minimal spacing before details
                                    }}
                                >
                                    <div>
                                        <strong>{ex.name}</strong>{ex.type && ` (${getExerciseTypeLabel(ex.type)})`}
                                    </div>
                                    <Button isOpen={isOpen} onClick={() => toggleExercise(ex.id)}>
                                        {isOpen ? "Hide Details" : "Show Details"}
                                    </Button>
                                </div>
                                {isOpen && (
                                    <div style={{marginTop: "4px"}}>
                                        {ex.tips && (
                                            <div style={{marginBottom: ex.notes ? "2px" : 0}}>
                                                <em>Tip:</em> {ex.tips}
                                            </div>
                                        )}
                                        {ex.notes && (
                                            <div>
                                                <em>Notes:</em> {ex.notes}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </CollapsiblePanel>
    );
};

export default ListExercises;
