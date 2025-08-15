import {gql} from 'graphql-tag';

// Mutation to create a PlanDay
export const createPlanDay = gql`
  mutation CreatePlanDay($input: CreatePlanDayInput!) {
    createPlanDay(input: $input) {
      id
      planId
      name
      notes
      dayOfWeek
      dayNumber
    }
  }
`;

export const updatePlanExercise = gql`
  mutation UpdatePlanExercise($input: UpdatePlanExerciseInput!) {
    updatePlanExercise(input: $input) {
      id
      order
    }
  }
`;


