import { gql } from "graphql-tag";

export const getExerciseLogQuery = gql`
  query GetExerciseLog($id: ID!) {
    getExerciseLog(id: $id) {
      id
      planExerciseId
      date
      sets
      clientNotes
    }
  }
`;
//
// export const getExerciseLogByPlanExerciseIdQuery = gql`
//   query GetExerciseLogByPlanExerciseId($planExerciseId: ID!) {
//     listExerciseLogs(filter: { planExerciseId: { eq: $planExerciseId } }) {
//       items {
//         id
//         planExerciseId
//         date
//         sets
//         clientNotes
//       }
//     }
//   }
// `;
