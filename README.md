## AWS Amplify React+Vite Starter Template

This repository provides a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

# 🏋️‍♂️ Training Plan Data Model Guide

This guide explains how the different parts of the data model work together to create a personalized training plan for clients.

## 📦 Overview

Your training app uses a clear data structure to organize:

- Plans
- Days within plans
- Exercises on each day
- Exercise metadata
- Logged workout data

---

## 🧠 Data Hierarchy

```
Plan
├── PlanDays (Monday, Tuesday, etc.)
│   ├── PlanExercises (linked to Exercises)
│   │   └── Exercise (name, tips, type, notes)
│   └── ...
└── Metadata (name, clientEmail, trainerEmail)
```

---

## 🪜 How to Build a Plan

This is the full process to create a structured workout plan:

### 1. Create a Plan

The top-level object that ties the entire program together.

```ts
await createPlan({
  name: "6-Week Strength Plan",
  trainerEmail: "trainer@example.com",
  clientEmail: "client@example.com"
});
```

---

### 2. Create PlanDays

Each day in the plan corresponds to a weekday (e.g. "MONDAY").

```ts
await createPlanDay({
  planId: "abc123",
  dayOfWeek: "MONDAY", // Enum: "MONDAY" | "TUESDAY" | ...
  dayNumber: 1         // Used to sort days
});
```

---

### 3. Create Exercises (If needed)

Each Exercise is reusable across multiple plans.

```ts
await createExercise({
  name: "Barbell Squat",
  type: "LIFT",
  tips: "Keep your chest up",
  notes: "Focus on depth"
});
```

---

### 4. Link Exercises to Days via PlanExercises

Each PlanExercise connects an Exercise to a PlanDay with configuration:

```ts
await createPlanExercise({
  planDayId: "day123",
  exerciseId: "exercise456",
  order: 1,
  suggestedReps: 10,
  suggestedWeight: 100
});
```

---

### 5. Display the Plan to a Client

Using `getPlanById`, retrieve all details:

```graphql
query GetPlanById($id: ID!) {
  getPlan(id: $id) {
    name
    planDays {
      items {
        dayOfWeek
        planExercises {
          items {
            order
            suggestedReps
            suggestedWeight
            exercise {
              name
              tips
              type
            }
          }
        }
      }
    }
  }
}
```

You can now render a full view of what to do on Monday, Tuesday, etc.

---

### 6. Log an Exercise (Client Side)

Clients track their workouts via `ExerciseLog`.

```ts
await createExerciseLog({
  planExerciseId: "xyz123",
  date: "2025-06-28",
  sets: [
    { reps: 10, weight: 100 },
    { reps: 10, weight: 100 },
    { reps: 8, weight: 95 }
  ],
  clientNotes: "Felt strong!"
});
```

---

## 📊 Example Data Structure

```json
{
  "name": "6-Week Strength Plan",
  "planDays": [
    {
      "dayOfWeek": "MONDAY",
      "planExercises": [
        {
          "exercise": { "name": "Squat" },
          "suggestedReps": 10,
          "suggestedWeight": 100
        },
        {
          "exercise": { "name": "Bench Press" },
          "suggestedReps": 8,
          "suggestedWeight": 80
        }
      ]
    },
    {
      "dayOfWeek": "TUESDAY",
      "planExercises": [
        {
          "exercise": { "name": "5k Run" }
        }
      ]
    }
  ]
}
```

---

## 🧩 Data Model Summary

| Entity           | Purpose                                | Linked To               |
|------------------|----------------------------------------|--------------------------|
| `Exercise`       | Defines a type of workout              | Used in `PlanExercise`   |
| `Plan`           | A client's full training program       | Has many `PlanDay`       |
| `PlanDay`        | A day in the plan (e.g. Monday)        | Has many `PlanExercise`  |
| `PlanExercise`   | Configured exercise for a specific day | Links `Exercise` & `PlanDay` |
| `ExerciseLog`    | What the client actually did           | Linked to `PlanExercise` |

---

## ✅ Example Workflow

1. **Trainer** creates a `Plan` for a client.
2. Trainer adds `PlanDay` entries (Monday, Tuesday…).
3. Trainer links `Exercise` to each day via `PlanExercise`.
4. **Client** sees a structured weekly workout plan.
5. Client logs workouts using `ExerciseLog`.

---

## 📁 Related Files

| File            | Purpose                                   |
|------------------|--------------------------------------------|
| `mutations.ts`  | Create plans, days, exercises, etc.        |
| `queries.ts`    | Fetch plans, days, exercises, logs         |
| `types.ts`      | Strong typing for queries and enums        |

---

## 💡 Tip

You can preload reusable `Exercise` entries in your database so that trainers can quickly assign them to new plans.

---

## 🛠️ Future Ideas

- Add tags or categories to Exercises (e.g. "Upper Body", "Cardio")
- Track actual vs. suggested weights in ExerciseLogs
- Add progression rules to Plans (e.g. increase weight weekly)
