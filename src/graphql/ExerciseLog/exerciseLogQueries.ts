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

export const getLatestExerciseLogByPlanExerciseIdQuery = /* GraphQL */ `
  query GetLatestExerciseLogByPlanExerciseId($planExerciseId: ID!) {
    listExerciseLogs(
      filter: { planExerciseId: { eq: $planExerciseId } }
      sortDirection: DESC
      limit: 1
    ) {
      items {
        id
        planExerciseId
        date
        sets
        clientNotes
      }
    }
  }
`;
