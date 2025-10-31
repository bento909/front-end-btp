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