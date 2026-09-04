## front-end-btp

Ben's personal site: a public landing page (bio, personal training pitch, music player, interval timer, MIDI clock tracker, contact form) plus an authenticated multi-tenant training-plan app where trainers build workout plans for clients and clients log their workouts.

Built on the [AWS Amplify React+Vite Gen2 starter](https://docs.amplify.aws/react/start/quickstart/), since extended well past the starter template.

## Tech stack

- React 18 + TypeScript + Vite, React Router v6
- Redux Toolkit (`src/redux/`)
- Styled-components
- `@hello-pangea/dnd` for drag-to-reorder exercises
- **AWS Amplify Gen2** backend (`amplify/`):
  - Cognito user pool for auth (`amplify/auth/resource.ts`)
  - AppSync GraphQL API + DynamoDB via `a.model()` schema definitions (`amplify/data/resource.ts`)
  - Three custom Lambda resolvers: `createOrgUser`, `listOrgUsers`, `createOrganization` (`amplify/functions/`)
  - All client-side data access goes through Amplify's typed generated client (`generateClient<Schema>()`, wired up in `src/graphql/dataClient.ts`) — there is no hand-written GraphQL in this app
- Deploys via AWS Amplify Hosting on push to `main` (`amplify.yml`)

## Architecture: multi-tenant organizations

Every trainer/client belongs to an **Organization** — the tenant boundary, enforced server-side via a Cognito Group per org (the group name *is* the org id). `organizationId` is carried on every org-scoped model, with `allow.groupDefinedIn('organizationId')` authorization.

**Roles** (`src/Constants/constants.tsx`):

| Role | Can do |
|---|---|
| `admin` | Manage org users (create admin/trainer/basic_user), manage plans, view all org members |
| `trainer` | Create clients (basic_user only), create exercises, manage plans for their own clients, view only the clients they created |
| `basic_user` | View their own plan, log completed workouts |

`admin`/`trainer` accounts are also members of a second, per-org `<orgId>-staff` Cognito Group — that's the group `Plan`/`PlanDay`/`PlanExercise`/`Exercise` write authorization actually checks (org members can read; only staff can write).

**`platform-admin`** is a separate, static, cross-org Cognito Group (not tied to any org's own `admin` role) — the only accounts that can create a brand-new Organization (via the `provisionOrganization` mutation) and moderate the public contact form's messages.

## Data model

```
Organization (id, name)

Plan (name, trainerEmail, clientEmail, organizationId, staffGroup)
 └─ PlanDay (dayOfWeek, dayNumber, organizationId, staffGroup)
     └─ PlanExercise (order, suggestedReps/Weight/Sets, organizationId, staffGroup)
         ├─ belongsTo → Exercise (name, type, tips, notes, organizationId, staffGroup)
         └─ hasMany → ExerciseLog (date, sets: json, clientNotes, organizationId)

ContactMessage (name, email, message, read) — public contact form submissions
```

`Plan`/`PlanDay`/`PlanExercise` are fetched **lazily**, not eagerly nested: a plan's days load once when the plan loads, but a day's exercises only fetch the moment that day is expanded in the UI (see `src/redux/planExercisesSlice.tsx`). This is deliberate — a trainer with many clients and plans shouldn't pull every exercise on every plan just to load their dashboard.

## Local development

```
npm install
npx ampx sandbox --profile <your-aws-profile>   # spins up a personal backend, writes amplify_outputs.json
npm run dev
```

`npm run build` runs `tsc` then `vite build` — always run this (or at least `tsc --noEmit`) before considering a change done; the CI build will fail on type errors.

## Testing

**Type checking:** `npx tsc --noEmit -p .` (frontend) and `npx tsc --noEmit -p amplify` (backend).

**End-to-end (Playwright):** `e2e/` holds a full E2E suite that runs against the **live production URL** (`https://main.d276q2mvykjvwc.amplifyapp.com`), not a local dev server — the point is verifying what's actually deployed. It covers auth, every role's panel visibility, cross-org isolation, ownership scoping, org creation, contact message moderation, and the full plan/exercise CRUD + drag-reorder + lazy-loading behavior.

```
npm run test:e2e          # run the full suite
npm run test:e2e:report   # open the HTML report from the last run
```

The suite authenticates as a set of permanent QA fixture accounts (one per role, across two organizations) rather than creating throwaway users per run. If `.env.qa.json` (gitignored) is missing or the fixture needs to be (re-)created, run:

```
npm run qa:provision
```

This creates/repairs the fixture directly in production via the real app mutations (`provisionOrganization`, `createOrgUser`) — safe to re-run, existing accounts are left alone. It targets `scripts/qa/amplify_outputs.json` (generate via `npx ampx generate outputs --app-id d276q2mvykjvwc --branch main --profile <admin-profile> --out-dir ./scripts/qa`), deliberately separate from the sandbox `amplify_outputs.json` used for local dev.

## Deploying to AWS

Push to `main` — Amplify Hosting builds and deploys automatically (`amplify.yml`). For manual backend/CLI operations, see [Amplify's deployment docs](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
