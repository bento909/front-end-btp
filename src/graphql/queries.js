import { gql } from 'graphql-tag';

// 1. Fetch all Plans
export const listPlans = gql`
  query ListPlans {
    listPlans {
      items {
        id
        name
        trainerEmail
        clientEmail
        planDays {
          items {
            id
            dayOfWeek
            dayNumber
            planExercises {
              items {
                id
                order
                suggestedReps
                suggestedWeight
              }
            }
          }
        }
      }
    }
  }
`;

// 2. Fetch all Exercises
export const listExercises = gql`
  query ListExercises {
    listExercises {
      items {
        id
        name
        type
        tips
        notes
        planExercises {
          items {
            id
            planId
            order
            suggestedReps
            suggestedWeight
          }
        }
      }
    }
  }
`;

// 3. Fetch all PlanExercises
export const listPlanExercises = gql`
  query ListPlanExercises {
    listPlanExercises {
      items {
        id
        planId
        exerciseId
        order
        suggestedReps
        suggestedWeight
        exercise {
          id
          name
          type
        }
        planDay {
          id
          dayOfWeek
          dayNumber
        }
      }
    }
  }
`;

// 4. Fetch all PlanDays
export const listPlanDays = gql`
  query ListPlanDays {
    listPlanDays {
      items {
        id
        planId
        dayOfWeek
        dayNumber
        plan {
          id
          name
        }
        planExercises {
          items {
            id
            order
            suggestedReps
            suggestedWeight
          }
        }
      }
    }
  }
`;

// 5. Fetch all ExerciseLogs
export const listExerciseLogs = gql`
  query ListExerciseLogs {
    listExerciseLogs {
      items {
        id
        planExerciseId
        date
        sets
        clientNotes
        planExercise {
          id
          planId
          exerciseId
          order
        }
      }
    }
  }
`;

// 6. Fetch a specific Plan by ID
export const getPlanById = gql`
  query GetPlanById($id: ID!) {
    getPlan(id: $id) {
      id
      name
      trainerEmail
      clientEmail
      planDays {
        items {
          id
          dayOfWeek
          dayNumber
          planExercises {
            items {
              id
              order
              suggestedReps
              suggestedWeight
            }
          }
        }
      }
    }
  }
`;

// 7. Fetch a specific Exercise by ID
export const getExerciseById = gql`
  query GetExerciseById($id: ID!) {
    getExercise(id: $id) {
      id
      name
      type
      tips
      notes
      planExercises {
        items {
          id
          planId
          order
          suggestedReps
          suggestedWeight
        }
      }
    }
  }
`;

// 8. Fetch a specific PlanExercise by ID
export const getPlanExerciseById = gql`
  query GetPlanExerciseById($id: ID!) {
    getPlanExercise(id: $id) {
      id
      planId
      exerciseId
      order
      suggestedReps
      suggestedWeight
      planDay {
        id
        dayOfWeek
        dayNumber
      }
      exercise {
        id
        name
        type
      }
    }
  }
`;

// 9. Fetch a specific PlanDay by ID
export const getPlanDayById = gql`
  query GetPlanDayById($id: ID!) {
    getPlanDay(id: $id) {
      id
      planId
      dayOfWeek
      dayNumber
      plan {
        id
        name
      }
      planExercises {
        items {
          id
          order
          suggestedReps
          suggestedWeight
        }
      }
    }
  }
`;

// 10. Fetch a specific ExerciseLog by ID
export const getExerciseLogById = gql`
  query GetExerciseLogById($id: ID!) {
    getExerciseLog(id: $id) {
      id
      planExerciseId
      date
      sets
      clientNotes
      planExercise {
        id
        planId
        exerciseId
      }
    }
  }
`;
