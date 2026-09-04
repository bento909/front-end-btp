export type DayOfWeek =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export enum ExerciseTypeEnum {
    LIFT = "LIFT",
    RUN = "RUN",
    CYCLE = "CYCLE",
    INTERVAL = "INTERVAL",
    KB_SWING = "KB_SWING",
}

// Define the type for each item
export interface ExerciseTypeInfo {
    type: ExerciseTypeEnum;
    label: string;
}

// Now use that type for the array
export const ExerciseTypeMetadata: ExerciseTypeInfo[] = [
    { type: ExerciseTypeEnum.LIFT, label: "Lift Weight" },
    { type: ExerciseTypeEnum.RUN, label: "Run" },
    { type: ExerciseTypeEnum.CYCLE, label: "Cycle" },
    { type: ExerciseTypeEnum.INTERVAL, label: "Interval Training" },
    { type: ExerciseTypeEnum.KB_SWING, label: "Kettlebells" },
];