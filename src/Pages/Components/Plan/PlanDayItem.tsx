import React, {useState} from "react";
import {ExerciseTypeEnum, ExerciseTypeMetadata, ListPlansQuery,} from "../../../graphql/types.ts";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../redux/store.tsx";
import {fetchExercisesThunk} from "../../../redux/exercisesSlice.tsx";
import {DragDropContext, Draggable, Droppable, DropResult,} from "react-beautiful-dnd";

interface Props {
    day: NonNullable<ListPlansQuery["listPlans"]["items"][0]>["planDays"]["items"][0],
    usesDayOfWeek: boolean,
    expanded: boolean,
    onToggle: () => void,
    onAddExercise: (
        dayId: string,
        exerciseId: string,
        order: number,
        suggestedReps: number,
        suggestedWeight: number
    ) => void,
    onReorderExercises: (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
        }[]
    ) => void
}


const formatDayName = (dayOfWeek: string): string =>
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

const PlanDayItem: React.FC<Props> = ({
                                          day,
                                          usesDayOfWeek,
                                          expanded,
                                          onToggle,
                                          onAddExercise,
                                          onReorderExercises
                                      }) => {
    const {exercises} = useSelector((state: RootState) => state.exercises);
    const dispatch = useDispatch<AppDispatch>();

    const [selectedType, setSelectedType] = useState<ExerciseTypeEnum | "">("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
    const [suggestedReps, setSuggestedReps] = useState<number>(10);
    const [suggestedWeight, setSuggestedWeight] = useState<number>(50);

    if (exercises.length === 0) {
        dispatch(fetchExercisesThunk());
    }

    const handleDragEnd = (result: DropResult) => {
        const {source, destination} = result;
        if (!destination || source.index === destination.index) return;

        const reordered = [...day.planExercises.items]
            .slice()
            .sort((a, b) => a.order - b.order);

        const [movedItem] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, movedItem);

        const updated = reordered.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        onReorderExercises(day.id, updated);
    };

    const filteredExercises = selectedType
        ? exercises.filter((ex) => ex.type === selectedType)
        : [];

    const handleAddExercise = () => {
        if (selectedExerciseId) {
            const nextOrder = day.planExercises.items.length + 1;
            onAddExercise(
                day.id,
                selectedExerciseId,
                nextOrder,
                suggestedReps,
                suggestedWeight
            );
            setSelectedExerciseId("");
            setSelectedType("");
        }
    };

    return (
        <li>
            <button onClick={onToggle}>
                {usesDayOfWeek
                    ? formatDayName(day.dayOfWeek!)
                    : `Day ${day.dayNumber}`}{" "}
                {expanded ? "▲" : "▼"}
            </button>

            {expanded && (
                <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={`droppable-${day.id}`}>
                            {(provided) => (
                                <ul
                                    style={{marginLeft: 16}}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {day.planExercises.items.length === 0 ? (
                                        <li>No exercises</li>
                                    ) : (
                                        day.planExercises.items
                                            .slice()
                                            .sort((a, b) => a.order - b.order)
                                            .map((ex, index) => {
                                                const exercise = exercises.find(
                                                    (e) => e.id === ex.exerciseId
                                                );
                                                return (
                                                    <Draggable
                                                        key={ex.id}
                                                        draggableId={ex.id}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    padding: "8px",
                                                                    marginBottom: "4px",
                                                                    background: "#f9f9f9",
                                                                    border: "1px solid #ddd",
                                                                    borderRadius: "4px",
                                                                }}
                                                            >
                                <span>
                                  <strong>
                                    {exercise
                                        ? exercise.name
                                        : "Unknown Exercise"}
                                  </strong>
                                  <br/>
                                    {ex.suggestedReps} Reps, {ex.suggestedWeight}{" "}
                                    Kg
                                </span>
                                                                <span>
                                  {/* Placeholder Edit/Delete buttons */}
                                                                    <button
                                                                        onClick={() =>
                                                                            console.log("Edit clicked", ex)
                                                                        }
                                                                        style={{marginLeft: 8}}
                                                                    >
                                    Edit
                                  </button>
                                  <button
                                      onClick={() =>
                                          console.log("Delete clicked", ex.id)
                                      }
                                      style={{marginLeft: 4}}
                                  >
                                    Delete
                                  </button>
                                </span>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                );
                                            })
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    <div style={{marginTop: 12, marginLeft: 16, maxWidth: 300}}>
                        <div style={{marginBottom: 8}}>
                            <label>
                                Exercise Type:<br/>
                                <select
                                    value={selectedType}
                                    onChange={(e) =>
                                        setSelectedType(e.target.value as ExerciseTypeEnum)
                                    }
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
                                            onChange={(e) =>
                                                setSuggestedReps(Number(e.target.value))
                                            }
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
                                            onChange={(e) =>
                                                setSuggestedWeight(Number(e.target.value))
                                            }
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
