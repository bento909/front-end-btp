import {gql} from 'graphql-tag';

// Mutation to create an Exercise
export const createExercise = gql`
  mutation CreateExercise($input: CreateExerciseInput!) {
    createExercise(input: $input) {
      id
      name
      type
      tips
      notes
    }
  }
`;

// Mutation to create a Plan
export const createPlan = gql`
  mutation CreatePlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      id
      name
      trainerEmail
      clientEmail
    }
  }
`;


