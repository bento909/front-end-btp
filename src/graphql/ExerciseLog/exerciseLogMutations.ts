import {gql} from 'graphql-tag';

export const createExerciseLogMutation = gql`
  mutation CreateExerciseLog($input: CreateExerciseLogInput!) {
    createExerciseLog(input: $input) {
      id
      planExerciseId
      date
      sets
      clientNotes
    }
  }
`;

export const updateExerciseLogMutation = gql`
  mutation UpdateExerciseLog($input: UpdateExerciseLogInput!) {
    updateExerciseLog(input: $input) {
      id
      planExerciseId
      date
      sets
      clientNotes
    }
  }
`;