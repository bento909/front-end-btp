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
            const nextOrder = day.planExercises.items.length + 1;
            onAddExercise(day.id, selectedExerciseId, nextOrder, suggestedReps, suggestedWeight);
            setSelectedExerciseId("");
            setSelectedType("");
        }
    };

    return (
        <li>
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
                            day.planExercises.items
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((ex) => {
                                    const exercise = exercises.find((e) => e.id === ex.exerciseId);
                                    return (
                                        <li key={ex.id}>
                                            <strong>{exercise ? exercise.name : "Unknown Exercise"}</strong><br/>
                                            {ex.suggestedReps} Reps, {ex.suggestedWeight} Kg
                                        </li>
                                    );
                                }
                            )
                        )}
                    </ul>

                    {/* Add exercise UI */}
                    <div style={{marginTop: 12, marginLeft: 16, maxWidth: 300}}>
                        <div style={{marginBottom: 8}}>
                            <label>
                                Exercise Type:<br/>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value as ExerciseTypeEnum)}
                                    style={{width: "100%"}}
                                >
                                    <option value="" disabled>Select type</option>
                                    {ExerciseTypeMetadata.map(({type, label}) => (
                                        <option key={type} value={type}>{label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {selectedType && (
                            <>
                                <div style={{marginBottom: 8}}>
                                    <label>
                                        Exercise:<br/>
                                        <select
                                            value={selectedExerciseId}
                                            onChange={(e) => setSelectedExerciseId(e.target.value)}
                                            style={{width: "100%"}}
                                        >
                                            <option value="" disabled>Select exercise</option>
                                            {filteredExercises.map((ex) => (
                                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div style={{marginBottom: 8}}>
                                    <label>
                                        Reps:<br/>
                                        <input
                                            type="number"
                                            value={suggestedReps}
                                            onChange={(e) => setSuggestedReps(Number(e.target.value))}
                                            style={{width: "100%"}}
                                        />
                                    </label>
                                </div>

                                <div style={{marginBottom: 8}}>
                                    <label>
                                        Weight (Kg):<br/>
                                        <input
                                            type="number"
                                            value={suggestedWeight}
                                            onChange={(e) => setSuggestedWeight(Number(e.target.value))}
                                            style={{width: "100%"}}
                                        />
                                    </label>
                                </div>
                            </>
                        )}

                        <button
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
