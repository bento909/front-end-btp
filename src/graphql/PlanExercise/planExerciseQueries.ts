import {gql} from "graphql-tag";
import {DocumentNode} from "graphql";

export class PlanExerciseQueries {
    
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
}