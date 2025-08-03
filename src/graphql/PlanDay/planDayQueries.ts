import {gql} from "graphql-tag";
import {DocumentNode} from "graphql";

export class planDayQueries {
    
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
}
