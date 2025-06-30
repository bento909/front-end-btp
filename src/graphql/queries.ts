import {gql} from "graphql-tag";
import {DocumentNode} from "graphql";

export class GraphQLQueries {
    // 1. Fetch all Plans
    static listPlans: DocumentNode = gql`
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
                  exerciseId
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
    static listExercises: DocumentNode = gql`
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
    static listPlanExercises: DocumentNode = gql`
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
    static listPlanDays: DocumentNode = gql`
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
    static listExerciseLogs: DocumentNode = gql`
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
    static getPlanById: DocumentNode = gql`
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
    static getExerciseById: DocumentNode = gql`
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
    static getPlanExerciseById: DocumentNode = gql`
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
    static getPlanDayById: DocumentNode = gql`
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
    static getExerciseLogById: DocumentNode = gql`
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
}
