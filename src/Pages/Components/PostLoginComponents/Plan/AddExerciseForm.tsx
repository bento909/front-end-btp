import React, {useState} from "react";
import {ExerciseTypeEnum, ExerciseTypeMetadata} from "../../../../graphql/types.ts";

interface AddExerciseFormProps {
    onAddExercise: (
        exerciseId: string,
        suggestedReps: number,
        suggestedWeight: number,
        suggestedSets: number
    ) => void;
    exercises: Array<{ id: string; name: string; type: ExerciseTypeEnum }>;
}

const AddExerciseForm: React.FC<AddExerciseFormProps> = ({onAddExercise, exercises}) => {
    const [selectedType, setSelectedType] = useState<ExerciseTypeEnum | "">("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    const [suggestedReps, setSuggestedReps] = useState<number>(10);
    const [suggestedWeight, setSuggestedWeight] = useState<number>(50);
    const [suggestedSets, setSuggestedSets] = useState<number>(3);

    const filteredExercises = selectedType
        ? exercises.filter((ex) => ex.type === selectedType)
        : [];

    const handleAdd = () => {
        if (selectedExerciseId) {
            onAddExercise(selectedExerciseId, suggestedReps, suggestedWeight, suggestedSets);
            setSelectedExerciseId("");
            setSelectedType("");
        }
    };

    return (
        <div style={{marginTop: 12, maxWidth: 300}}>
            <div style={{marginBottom: 8}}>
                <label>
                    Exercise Type:<br/>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as ExerciseTypeEnum)}
                        style={{width: "100%"}}
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

                    <div style={{marginBottom: 8}}>
                        <label>
                            Sets:<br/>
                            <input
                                type="number"
                                value={suggestedSets}
                                onChange={(e) => setSuggestedSets(Number(e.target.value))}
                                style={{width: "100%"}}
                            />
                        </label>
                    </div>
                </>
            )}

            <button disabled={!selectedExerciseId} onClick={handleAdd}>
                Add Exercise
            </button>
        </div>
    );
};

export default AddExerciseForm;
