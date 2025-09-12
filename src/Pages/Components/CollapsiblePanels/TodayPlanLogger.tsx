// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../redux/store";
// import { Plan, DayOfWeek } from "../../../graphql/types";
// import { client } from "../../../graphql/graphqlClient";
// import { GraphQLResult } from "@aws-amplify/api-graphql";
// import { createExerciseLog } from "../../../graphql/PlanExercise/planExerciseMutations";
// import { CreateExerciseLogInput } from "../../../graphql/PlanExercise/planExerciseTypes.ts";
//
// const WEEK_DAYS: DayOfWeek[] = [
//     "MONDAY",
//     "TUESDAY",
//     "WEDNESDAY",
//     "THURSDAY",
//     "FRIDAY",
//     "SATURDAY",
//     "SUNDAY",
// ];
//
// function getTodaysPlanDay(plan: Plan) {
//     const usesDayOfWeek = plan.planDays.items.every((d) => Boolean(d.dayOfWeek));
//     const today = new Date();
//
//     if (usesDayOfWeek) {
//         const todayIndex = today.getDay(); // 0 = Sunday
//         const todayName: DayOfWeek = WEEK_DAYS[(todayIndex + 6) % 7]; // shift so MON=0
//         return plan.planDays.items.find((d) => d.dayOfWeek === todayName);
//     } else {
//         const currentDayNumber = 1; // TODO: replace with actual day number logic
//         return plan.planDays.items.find((d) => d.dayNumber === currentDayNumber);
//     }
// }
//
// const TodayPlanLogger: React.FC = () => {
//     const { plan } = useSelector((state: RootState) => state.plans);
//     const [logs, setLogs] = useState<Record<string, { sets?: number; notes?: string }>>({});
//     const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
//
//     if (!plan) return <p>No plan found.</p>;
//
//     const todaysDay = getTodaysPlanDay(plan);
//     if (!todaysDay) return <p>No exercises for today.</p>;
//
//     const handleChange = (exerciseId: string, field: "sets" | "notes", value: string) => {
//         setLogs((prev) => ({
//             ...prev,
//             [exerciseId]: {
//                 ...prev[exerciseId],
//                 [field]: field === "sets" ? Number(value) : value,
//             },
//         }));
//     };
//
//     const handleLog = async (exerciseId: string) => {
//         const entry = logs[exerciseId];
//         if (!entry || entry.sets === undefined) {
//             alert("Please enter sets done.");
//             return;
//         }
//
//         setLoadingIds((prev) => new Set(prev).add(exerciseId));
//
//         const input: CreatePlanExerciseInput = {
//             exerciseId: exerciseId,
//             date: new Date().toISOString(),
//             sets: entry.sets,
//             clientNotes: entry.notes,
//         };
//
//         try {
//             await client.graphql({
//                 query: createExerciseLog,
//                 variables: { input },
//             }) as GraphQLResult<any>;
//
//             alert("Logged successfully ✅");
//             // Optionally reset inputs:
//             setLogs((prev) => ({ ...prev, [exerciseId]: { sets: undefined, notes: "" } }));
//         } catch (err) {
//             console.error("Failed to log exercise", err);
//             alert("Failed to log exercise ❌");
//         } finally {
//             setLoadingIds((prev) => {
//                 const next = new Set(prev);
//                 next.delete(exerciseId);
//                 return next;
//             });
//         }
//     };
//
//     return (
//         <div>
//             <h4>{plan.name} - Today</h4>
//             <h5>{todaysDay.dayOfWeek ?? `Day ${todaysDay.dayNumber}`}</h5>
//
//             {todaysDay.planExercises.items.length === 0 ? (
//                 <p>No exercises today.</p>
//             ) : (
//                 <ul>
//                     {todaysDay.planExercises.items
//                         .sort((a, b) => a.order - b.order)
//                         .map((exercise) => (
//                             <li key={exercise.id} style={{ marginBottom: "1rem" }}>
//                                 <div>Exercise ID: {exercise.exerciseId}</div>
//                                 <div>Suggested Reps: {exercise.suggestedReps ?? "-"}</div>
//                                 <div>Suggested Weight: {exercise.suggestedWeight ?? "-"}</div>
//
//                                 <div style={{ marginTop: "0.5rem" }}>
//                                     <label>
//                                         Sets Done:
//                                         <input
//                                             type="number"
//                                             min={0}
//                                             value={logs[exercise.id]?.sets ?? ""}
//                                             onChange={(e) => handleChange(exercise.id, "sets", e.target.value)}
//                                             style={{ marginLeft: "0.5rem" }}
//                                         />
//                                     </label>
//
//                                     <label style={{ marginLeft: "1rem" }}>
//                                         Notes:
//                                         <input
//                                             type="text"
//                                             value={logs[exercise.id]?.notes ?? ""}
//                                             onChange={(e) => handleChange(exercise.id, "notes", e.target.value)}
//                                             style={{ marginLeft: "0.5rem" }}
//                                         />
//                                     </label>
//
//                                     <button
//                                         onClick={() => handleLog(exercise.id)}
//                                         disabled={loadingIds.has(exercise.id)}
//                                         style={{ marginLeft: "1rem" }}
//                                     >
//                                         {loadingIds.has(exercise.id) ? "Logging..." : "Log"}
//                                     </button>
//                                 </div>
//                             </li>
//                         ))}
//                 </ul>
//             )}
//         </div>
//     );
// };
//
// export default TodayPlanLogger;
