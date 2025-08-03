import {gql} from "graphql-tag";

export const createPlanExercise = gql`
  mutation CreatePlanExercise($input: CreatePlanExerciseInput!) {
    createPlanExercise(input: $input) {
      id
      planId
      exerciseId
      order
      suggestedReps
      suggestedWeight
      planDay {
        id
      }
    }
 }
`;

export const updatePlanExercise = gql`
  mutation UpdatePlanExercise($input: UpdatePlanExerciseInput!) {
    updatePlanExercise(input: $input) {
      id
      order
      suggestedReps
      suggestedWeight
    }
  }
`;