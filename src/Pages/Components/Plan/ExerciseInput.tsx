import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "../../../redux/store";
import {
    fetchLatestExerciseLogByPlanExerciseIdThunk,
    submitExerciseLogThunk,
    updateExerciseLogThunk
} from "../../../redux/exerciseLogSlice";
import TableButton from "../../../Styles/TableButton.tsx";

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

function removeSet() {
    console.log('remove Set');
}

function addSet() {
    console.log('add Set');
}

const ExerciseInput: React.FC<ExerciseInputProps> = ({planExercise, savedData, onChange}) => {
    const dispatch: AppDispatch = useDispatch();

    const [setsData, setSetsData] = useState(
        savedData ??
        Array.from({length: planExercise.suggestedSets}, () => ({
            reps: planExercise.suggestedReps?.toString() ?? "",
            weight: planExercise.suggestedWeight?.toString() ?? "",
        }))
    );
    const [submitted, setSubmitted] = useState<null | { id: string; sets: any[] }>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingIndex, setEditingIndex] = useState(0);

    useEffect(() => {
        dispatch(fetchLatestExerciseLogByPlanExerciseIdThunk(planExercise.id))
            .unwrap()
            .then((log) => {
                if (log) {
                    setSetsData(JSON.parse(log.sets));
                    setSubmitted({id: log.id, sets: JSON.parse(log.sets)});
                }
            })
            .catch((err) => console.error("No previous log or failed fetch:", err));
    }, [dispatch, planExercise.id]);

    useEffect(() => {
        onChange?.(setsData);
    }, [setsData, onChange]);

    const handleChange = (index: number, field: "reps" | "weight", value: string) => {
        setSetsData((prev) => {
            const updated = [...prev];
            updated[index] = {...updated[index], [field]: value};
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
            const result = await dispatch(submitExerciseLogThunk(logData)).unwrap();
            setSubmitted({id: result.id, sets: filteredSets});
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => setEditing(true);

    const handleSaveEdit = async () => {
        if (!submitted) return;
        setLoading(true);
        try {
            const filteredSets = setsData.filter((s) => s.reps !== "" || s.weight !== "");
            const updatedData = {
                id: submitted.id,
                sets: JSON.stringify(filteredSets),
            };
            const updatedLog = await dispatch(updateExerciseLogThunk(updatedData)).unwrap();
            console.log("Updated Exercise Log:", updatedLog);
            setSubmitted(updatedLog); // refresh local state with backend result
            setEditing(false);
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const renderControlButtons = (index: number) => {
        const isEditingThisRow = editingIndex === index;
        console.log('index is ' + index, 'there are ' + setsData.length + 'sets in this exercise');
        const isLastRow = index + 1 === setsData.length;
        const isFirstRow = index === 0;
        return (
            <td>
                {isEditingThisRow ? (
                    <TableButton
                        label="Submit"
                        onClick={() => {
                            console.log("submitting index ", index);
                            setEditingIndex(index + 1);
                        }}
                    />
                ) : (
                    <TableButton
                        label="Edit"
                        onClick={() => {
                            console.log("submitting index ", index);
                            setEditingIndex(index);
                        }}
                    />
                )}

                {(isLastRow && !isFirstRow) && (
                    <td>
                        <TableButton
                            label="+"
                            onClick={() => {
                                console.log("submitting index ", index);
                                addSet();
                            }}
                        />
                        <TableButton
                            label="-"
                            onClick={() => {
                                console.log("submitting index ", index);
                                removeSet();
                            }}
                        />
                    </td>)}
            </td>

        )
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
                                disabled={(editingIndex != index) || (!!submitted && !editing)}
                                onChange={(e) => handleChange(index, "reps", e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                min={0}
                                value={set.weight}
                                disabled={(editingIndex != index) || (!!submitted && !editing)}
                                onChange={(e) => handleChange(index, "weight", e.target.value)}
                            />
                        </td>
                        {renderControlButtons(index)}
                    </tr>
                ))}
                </tbody>
            </table>


            <div style={{textAlign: "right"}}>
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
