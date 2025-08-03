import React from "react";
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd";

interface ExerciseListDraggableProps {
    dayId: string;
    exercises: Array<{
        id: string;
        order: number;
        suggestedReps?: number;
        suggestedWeight?: number;
        exerciseId: string;
    }>;
    allExercises: Array<{ id: string; name: string }>;
    onReorderExercises: (
        dayId: string,
        reorderedItems: {
            id: string;
            order: number;
            suggestedReps?: number;
            suggestedWeight?: number;
        }[]
    ) => void;
}

const ExerciseListDraggable: React.FC<ExerciseListDraggableProps> = ({
                                                                         dayId,
                                                                         exercises,
                                                                         allExercises,
                                                                         onReorderExercises,
                                                                     }) => {
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
                              {ex.suggestedReps} Reps, {ex.suggestedWeight} Kg
                          </span>
                                                    <span>
                            <button
                                onClick={() => console.log("Edit clicked", ex)}
                                style={{marginLeft: 8}}
                            >
                              Edit
                            </button>
                            <button
                                onClick={() => console.log("Delete clicked", ex.id)}
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
