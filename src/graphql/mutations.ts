import {gql} from 'graphql-tag';

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

// Mutation to delete a Plan — used as compensating cleanup (BTP-5) when
// parallel PlanDay creation partially fails.
export const deletePlan = gql`
  mutation DeletePlan($input: DeletePlanInput!) {
    deletePlan(input: $input) {
      id
    }
  }
`;


