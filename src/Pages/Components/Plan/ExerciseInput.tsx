import React, {useEffect, useState} from "react";
import {submitExerciseLogThunk} from "../../../redux/exerciseLogSlice.tsx";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../redux/store.tsx";

interface PlanExercise {
    id: string;
    exerciseName: string;
    suggestedSets: number;
    suggestedReps: number;
    suggestedWeight: number,
}

interface ExerciseInputProps {
    planExercise: PlanExercise;
    savedData?: {reps: string; weight: string}[];
    onChange?: (data: {reps: string; weight: string}[]) => void;
}

const ExerciseInput: React.FC<ExerciseInputProps> = ({ planExercise, savedData, onChange }) => {
    const [setsData, setSetsData] = useState(
        savedData ??
        Array.from({ length: planExercise.suggestedSets }, () => ({
            reps: planExercise.suggestedReps?.toString() ?? "",
            weight: planExercise.suggestedWeight?.toString() ?? "",
        }))
    );
    const dispatch: AppDispatch = useDispatch();
    
    useEffect(() => {
        if(onChange) onChange(setsData);
    }, [setsData, onChange]);

    const handleChange = (index: number, field: "reps" | "weight", value: string) => {
        setSetsData((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = () => {
        console.log("Submit ExerciseLog for", planExercise.id, setsData);
        
        const filteredSets = setsData.filter((s) => s.reps !== "" || s.weight !== "");
        
        const logData = {
            planExerciseId : planExercise.id,
            date: new Date().toISOString(),
            sets: JSON.stringify(filteredSets), //TODO chatGPT thinks I should be able to send straight Data rather than this.
        }
        console.log("about to submit exercise: ", logData)
        dispatch(submitExerciseLogThunk(logData))
            .unwrap()
            .then((result: any) => {
                console.log("Exercise Log Submitted!: ", result)
            })
            .catch((err: any) => {
                console.error("Submission failed:", err)
            });
    };

    return (
        <div>
            <h4>{planExercise.exerciseName}</h4>
            <table>
                <thead>
                <tr>
                    <th>Set</th>
                    <th>Reps</th>
                    <th>Weight (kg)</th>
                </tr>
                </thead>
                <tbody>
                {setsData.map((set, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                            <input
                                type="number"
                                min={0}
                                value={set.reps}
                                onChange={(e) => handleChange(index, "reps", e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                min={0}
                                value={set.weight}
                                onChange={(e) => handleChange(index, "weight", e.target.value)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={handleSubmit}>Submit ExerciseLog</button>
        </div>
    );
};

export default ExerciseInput;
