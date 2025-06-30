import React, { useState } from "react";
import {ExerciseTypeMetadata, ListPlansQuery} from "../../graphql/types";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import { ExerciseTypeEnum } from "../../graphql/types";
import {fetchExercisesThunk} from "../../redux/exercisesSlice.tsx";

interface Props {
    day: NonNullable<ListPlansQuery["listPlans"]["items"][0]>["planDays"]["items"][0];
    usesDayOfWeek: boolean;
    expanded: boolean;
    onToggle: () => void;
    onAddExercise: (dayId: string, exerciseId: string) => void; // Add this callback
}

const formatDayName = (dayOfWeek: string): string =>
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

const PlanDayItem: React.FC<Props> = ({ day, usesDayOfWeek, expanded, onToggle, onAddExercise }) => {
    const { exercises } = useSelector((state: RootState) => state.exercises);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedType, setSelectedType] = useState<ExerciseTypeEnum | "">("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    if(exercises.length === 0) {
        dispatch(fetchExercisesThunk());
    }
    // Filter exercises by selected type
    const filteredExercises = selectedType
        ? exercises.filter((ex) => ex.type === selectedType)
        : [];

    const handleAddExercise = () => {
        if (selectedExerciseId) {
            onAddExercise(day.id, selectedExerciseId);
            setSelectedExerciseId("");
            setSelectedType("");
        }
    };

    return (
        <li style={{ marginBottom: 12 }}>
            <button onClick={onToggle}>
                {usesDayOfWeek ? formatDayName(day.dayOfWeek!) : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <>
                    {/* List current exercises */}
                    <ul style={{ marginLeft: 16 }}>
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
                    <div style={{ marginTop: 12, marginLeft: 16 }}>
                        <label>
                            Exercise Type:{" "}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as ExerciseTypeEnum)}
                            >
                                <option value="" disabled>
                                    Select type
                                </option>
                                {ExerciseTypeMetadata.map(({ type, label }) => (
                                    <option key={type} value={type}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {selectedType && (
                            <label style={{ marginLeft: 8 }}>
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
                        )}

                        <button
                            style={{ marginLeft: 8 }}
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
