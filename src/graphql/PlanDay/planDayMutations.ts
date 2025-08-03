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

