import React from "react";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";

interface ExerciseListDraggableProps {
    dayId: string;
    exercises: Array<{
        id: string;
        order: number;
        suggestedReps?: number;
        suggestedWeight?: number;
        suggestedSets?: number;
        exerciseId: string;
    }>;
    allExercises: Array<{ id: string; name: string }>;
    onDeleteExercise: (
        exerciseId: string,
        onDeleteExercise: string
    ) => void;
    onReorderExercises: (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number;
        }[]
    ) => void;
    onEditExercises: (
        dayId: string,
        exerciseId: string,
        updates: {
            suggestedReps?: number;
            suggestedWeight?: number;
            suggestedSets?: number;
            order?: number;
        }
    ) => void;
}

const ExerciseListDraggable: React.FC<ExerciseListDraggableProps> = ({
                                                                         dayId,
                                                                         exercises,
                                                                         allExercises,
                                                                         onDeleteExercise,
                                                                         onReorderExercises,
                                                                         onEditExercises
                                                                     }) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [tempReps, setTempReps] = React.useState<number | undefined>();
    const [tempWeight, setTempWeight] = React.useState<number | undefined>();
    const [tempSets, setTempSets] = React.useState<number | undefined>();

    const handleDragEnd = (result: DropResult) => {
        const {source, destination} = result;
        if (!destination || source.index === destination.index) return;

        const reordered = [...exercises]
            .slice()
            .sort((a, b) => a.order - b.order);

        const [movedItem] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, movedItem);

        const updated = reordered.map((item, index) => ({
            id: item.id,
            order: index + 1,
            suggestedReps: item.suggestedReps,
            suggestedWeight: item.suggestedWeight,
            suggestedSets: item.suggestedSets
        }));

        onReorderExercises(dayId, updated);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`droppable-${dayId}`}>
                {(provided) => (
                    <ul
                        style={{marginLeft: 16}}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {exercises.length === 0 ? (
                            <li>No exercises</li>
                        ) : (
                            exercises
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map((ex, index) => {
                                    const exercise = allExercises.find((e) => e.id === ex.exerciseId);
                                    const isEditing = editingId === ex.id;
                                    return (
                                        <Draggable key={ex.id} draggableId={ex.id} index={index}>
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
                                                        background: "#f9f9f9",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "4px",
                                                    }}
                                                >
            <span>
              <strong>{exercise ? exercise.name : "Unknown Exercise"}</strong>
              <br/>
                {isEditing ? (
                    <>
                        <input
                            type="number"
                            value={tempReps ?? ex.suggestedReps ?? ""}
                            placeholder="Reps"
                            onChange={(e) => setTempReps(Number(e.target.value))}
                            style={{width: 60, marginRight: 8}}
                        />
                        <input
                            type="number"
                            value={tempWeight ?? ex.suggestedWeight ?? ""}
                            placeholder="Kg"
                            onChange={(e) => setTempWeight(Number(e.target.value))}
                            style={{width: 60}}
                        />
                        <input
                            type="number"
                            value={tempSets ?? ex.suggestedSets ?? ""}
                            placeholder="Sets"
                            onChange={(e) => setTempSets(Number(e.target.value))}
                            style={{width: 60}}
                        />
                    </>
                ) : (
                    <>
                        {ex.suggestedReps} Reps, {ex.suggestedWeight} Kg, {ex.suggestedSets}
                    </>
                )}
            </span>

                                                    <span>
              {isEditing ? (
                  <>
                      <button
                          onClick={() => {
                              onEditExercises(dayId, ex.id, {
                                  suggestedReps: tempReps,
                                  suggestedWeight: tempWeight,
                                  suggestedSets: tempSets
                              });
                              setEditingId(null);
                              setTempReps(undefined);
                              setTempWeight(undefined);
                              setTempSets(undefined);
                          }}
                          style={{marginLeft: 8}}
                      >
                          Save
                      </button>
                      <button
                          onClick={() => {
                              setEditingId(null);
                              setTempReps(undefined);
                              setTempWeight(undefined);
                          }}
                          style={{marginLeft: 4}}
                      >
                          Cancel
                      </button>
                  </>
              ) : (
                  <button
                      onClick={() => {
                          setEditingId(ex.id);
                          setTempReps(ex.suggestedReps);
                          setTempWeight(ex.suggestedWeight);
                          setTempSets(ex.suggestedSets)
                      }}
                      style={{marginLeft: 8}}
                  >
                      Edit
                  </button>
              )}

                                                        <button
                                                            onClick={() => onDeleteExercise(ex.id, dayId)}
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
    );
};

export default ExerciseListDraggable;
