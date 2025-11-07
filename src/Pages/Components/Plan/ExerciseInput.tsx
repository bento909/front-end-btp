import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import {
    submitExerciseLogThunk
} from "../../../redux/exerciseLogSlice";

interface PlanExercise {
    id: string;
    exerciseName: string;
    suggestedSets: number;
    suggestedReps: number;
    suggestedWeight: number;
}

interface ExerciseInputProps {
    planExercise: PlanExercise;
    savedData?: { reps: string; weight: string }[];
    onChange?: (data: { reps: string; weight: string }[]) => void;
}

const ExerciseInput: React.FC<ExerciseInputProps> = ({ planExercise, savedData, onChange }) => {
    const dispatch: AppDispatch = useDispatch();

    const [setsData, setSetsData] = useState(
        savedData ??
        Array.from({ length: planExercise.suggestedSets }, () => ({
            reps: planExercise.suggestedReps?.toString() ?? "",
            weight: planExercise.suggestedWeight?.toString() ?? "",
        }))
    );
    const [submitted, setSubmitted] = useState(false);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onChange?.(setsData);
    }, [setsData, onChange]);

    const handleChange = (index: number, field: "reps" | "weight", value: string) => {
        setSetsData((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        const filteredSets = setsData.filter((s) => s.reps !== "" || s.weight !== "");
        const logData = {
            planExerciseId: planExercise.id,
            date: new Date().toISOString(),
            sets: JSON.stringify(filteredSets),
        };

        try {
            await dispatch(submitExerciseLogThunk(logData)).unwrap();
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => setEditing(true);
    const handleSaveEdit = () => {
        setEditing(false);
        // optionally re-submit updated data
        // dispatch(submitExerciseLogThunk({ ...same logData, updated fields }));
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
                                disabled={submitted && !editing}
                                onChange={(e) => handleChange(index, "reps", e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                min={0}
                                value={set.weight}
                                disabled={submitted && !editing}
                                onChange={(e) => handleChange(index, "weight", e.target.value)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={{ textAlign: "right" }}>
                {!submitted && (
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Finish Exercise"}
                    </button>
                )}
                {submitted && !editing && <button onClick={handleEdit}>Edit</button>}
                {editing && <button onClick={handleSaveEdit}>Save Changes</button>}
            </div>
        </div>
    );
};


export default ExerciseInput;
