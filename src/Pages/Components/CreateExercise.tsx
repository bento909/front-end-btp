// import React, { useState } from "react";
// import CollapsiblePanel from "../../Styles/CollapsiblePanel.tsx";
// import { useSelector } from "react-redux";
// import { RootState } from "../../redux/store.tsx";
// import { createExercise } from "../../api/exerciseApi"; // Assuming you have an API for this
//
// interface TemplatePanelProps {
//     title?: string;
//     children: React.ReactNode;
// }
//
// const CreateExercisePanel: React.FC<TemplatePanelProps> = ({ title = "Create Exercise", children }) => {
//     const user = useSelector((state: RootState) => state.auth.user);
//     const [isOpen, setIsOpen] = useState(false);
//
//     const [exerciseName, setExerciseName] = useState("");
//     const [exerciseType, setExerciseType] = useState("");
//     const [exerciseTips, setExerciseTips] = useState("");
//     const [exerciseNotes, setExerciseNotes] = useState("");
//
//     const [error, setError] = useState("");
//
//     const togglePanel = () => {
//         setIsOpen((prev) => !prev);
//     };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//
//         if (!exerciseName || !exerciseType) {
//             setError("Exercise name and type are required.");
//             return;
//         }
//
//         try {
//             await createExercise({
//                 name: exerciseName,
//                 type: exerciseType,
//                 tips: exerciseTips,
//                 notes: exerciseNotes,
//             });
//             // Clear the form after submission
//             setExerciseName("");
//             setExerciseType("");
//             setExerciseTips("");
//             setExerciseNotes("");
//             setError(""); // Clear any error messages
//         } catch (err) {
//             setError("Failed to create the exercise. Please try again.");
//         }
//     };
//
//     return user && user.permissions.createExercise ? (
//         <CollapsiblePanel title={title} isOpen={isOpen} toggle={togglePanel}>
//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label htmlFor="exerciseName">Exercise Name</label>
//                     <input
//                         id="exerciseName"
//                         type="text"
//                         value={exerciseName}
//                         onChange={(e) => setExerciseName(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="exerciseType">Exercise Type</label>
//                     <select
//                         id="exerciseType"
//                         value={exerciseType}
//                         onChange={(e) => setExerciseType(e.target.value)}
//                         required
//                     >
//                         <option value="">Select type</option>
//                         <option value="LIFT">Lifting</option>
//                         <option value="RUN">Running</option>
//                         <option value="CYCLE">Cycling</option>
//                         <option value="INTERVAL">Interval</option>
//                         <option value="KB_SWING">KB Swing</option>
//                     </select>
//                 </div>
//                 <div>
//                     <label htmlFor="exerciseTips">Exercise Tips</label>
//                     <textarea
//                         id="exerciseTips"
//                         value={exerciseTips}
//                         onChange={(e) => setExerciseTips(e.target.value)}
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="exerciseNotes">Exercise Notes</label>
//                     <textarea
//                         id="exerciseNotes"
//                         value={exerciseNotes}
//                         onChange={(e) => setExerciseNotes(e.target.value)}
//                     />
//                 </div>
//                 {error && <p style={{ color: "red" }}>{error}</p>}
//                 <button type="submit">Create Exercise</button>
//             </form>
//         </CollapsiblePanel>
//     ) : null;
// };
//
// export default CreateExercisePanel;
