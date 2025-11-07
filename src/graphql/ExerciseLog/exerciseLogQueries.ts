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
