import React, {useState} from "react";
import {ExerciseTypeEnum, ExerciseTypeMetadata, ListPlansQuery} from "../../graphql/types";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import {fetchExercisesThunk} from "../../redux/exercisesSlice.tsx";

interface Props {
    day: NonNullable<ListPlansQuery["listPlans"]["items"][0]>["planDays"]["items"][0];
    usesDayOfWeek: boolean;
    expanded: boolean;
    onToggle: () => void;
    onAddExercise: (dayId: string, exerciseId: string, order: number, suggestedReps: number, suggestedWeight: number) => void;
}

const formatDayName = (dayOfWeek: string): string =>
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();


//called by PlanEditor
const PlanDayItem: React.FC<Props> = ({day, usesDayOfWeek, expanded, onToggle, onAddExercise}) => {
    const {exercises} = useSelector((state: RootState) => state.exercises);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedType, setSelectedType] = useState<ExerciseTypeEnum | "">("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    const [order, setOrder] = useState<number>(1);
    const [suggestedReps, setSuggestedReps] = useState<number>(10);
    const [suggestedWeight, setSuggestedWeight] = useState<number>(50);
    if (exercises.length === 0) {
        dispatch(fetchExercisesThunk());
    }
    // Filter exercises by selected type
    const filteredExercises = selectedType
        ? exercises.filter((ex) => ex.type === selectedType)
        : [];

    const handleAddExercise = () => {
        if (selectedExerciseId) {
            onAddExercise(day.id, selectedExerciseId, order, suggestedReps, suggestedWeight);
            setSelectedExerciseId("");
            setSelectedType("");
        }
    };

    return (
        <li style={{marginBottom: 12}}>
            <button onClick={onToggle}>
                {usesDayOfWeek ? formatDayName(day.dayOfWeek!) : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <>
                    {/* List current exercises */}
                    <ul style={{marginLeft: 16}}>
                        {day.planExercises.items.length === 0 ? (
                            <li>No exercises</li>
                        ) : (
                            day.planExercises.items.map((ex) => (
                                <li key={ex.id}>
                                    Order {ex.order}, Reps {ex.suggestedReps}, Weight {ex.suggestedWeight}
                                </li>
                            ))
                        )}
                    </ul>

                {/* Add exercise UI */}
                    <div style={{marginTop: 12, marginLeft: 16}}>
                        <label>
                            Exercise Type:{" "}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as ExerciseTypeEnum)}
                            >
                                <option value="" disabled>
                                    Select type
                                </option>
                                {ExerciseTypeMetadata.map(({type, label}) => (
                                    <option key={type} value={type}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {selectedType && (
                            <>
                                <label style={{marginLeft: 8}}>
                                    Exercise:{" "}
                                    <select
                                        value={selectedExerciseId}
                                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Select exercise
                                        </option>
                                        {filteredExercises.map((ex) => (
                                            <option key={ex.id} value={ex.id}>
                                                {ex.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                    Order:{" "}
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(Number(e.target.value))}
                                        style={{ width: 60 }}
                                    />
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                    Reps:{" "}
                                    <input
                                        type="number"
                                        value={suggestedReps}
                                        onChange={(e) => setSuggestedReps(Number(e.target.value))}
                                        style={{ width: 60 }}
                                    />
                                </label>
                                <label style={{ marginLeft: 8 }}>
                                    Weight:{" "}
                                    <input
                                        type="number"
                                        value={suggestedWeight}
                                        onChange={(e) => setSuggestedWeight(Number(e.target.value))}
                                        style={{ width: 80 }}
                                    />
                                </label>
                            </>
                        )}

                        <button
                            style={{marginLeft: 8}}
                            disabled={!selectedExerciseId}
                            onClick={handleAddExercise}
                        >
                            Add Exercise
                        </button>
                    </div>
                </>
            )}
        </li>
    );
};

export default PlanDayItem;
