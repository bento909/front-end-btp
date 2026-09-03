import {gql} from 'graphql-tag';

// Mutation to create a PlanDay
export const createPlanDay = gql`
  mutation CreatePlanDay($input: CreatePlanDayInput!) {
    createPlanDay(input: $input) {
      id
      planId
      dayOfWeek
      dayNumber
    }
  }
`;

// Mutation to delete a PlanDay — used as compensating cleanup (BTP-5) when
// parallel PlanDay creation partially fails.
export const deletePlanDay = gql`
  mutation DeletePlanDay($input: DeletePlanDayInput!) {
    deletePlanDay(input: $input) {
      id
    }
  }
`;
