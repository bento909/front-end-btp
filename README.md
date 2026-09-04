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

`npm run test:e2e` automatically runs `npm run qa:verify` first (via npm's `pretest:e2e` hook) — it checks the fixture's data-level invariants (most importantly, that the trainer-owned QA client's Monday exercise list is empty, which the self-cleaning exercise CRUD test depends on starting from) and repairs anything that's drifted. Needs no AWS credentials, only the fixture's own login (from `.env.qa.json`) — safe to run as often as you like, including manually: `npm run qa:verify`.

**Don't use the QA fixture accounts for manual poking around** — a stray exercise added "just to look" will break that Monday-must-be-empty invariant and produce confusing test failures later. For that, there's a separate, human-browsable **demo org** with realistic sample data (a trainer, a client, several named exercises, a populated week plan, one logged workout) that no test relies on:

```
npm run demo:provision
```

Credentials land in `.env.demo.json` (gitignored). Feel free to click around in it, edit things, log workouts — whenever you want it back to a clean, predictable state:

```
npm run demo:restore
```

Since there's no delete-Organization path anywhere in the app, "restore" means reconciling the org's *data* back to the canonical baseline (`scripts/qa/demo-data.ts` — the single source of truth both `demo:provision` and `demo:restore` read from), not recreating the org: it deletes anything that doesn't belong (stray exercises, extra plan-exercise entries, extra logs), fixes anything whose values were edited, and recreates anything deleted.

## Production data snapshot (`scripts/backup/`)

A portable export/import of the **entire** production account — every row of every table, plus every Cognito user/group/membership — not scoped to test data. Built for a "kill the app, take the data, reprovision somewhere else" scenario, not as a substitute for DynamoDB's own Point-in-Time Recovery (that's same-account/same-engine, restores into a new table — a different job; worth turning on separately as unrelated cheap insurance).

```
npm run backup:grab
```

Read-only, safe to run any time. Writes a timestamped snapshot to `scripts/backup/snapshots/<timestamp>/` (gitignored — contains real PII: names, emails, workout notes; never commit it).

```
npm run backup:restore                        # dry run against the most recent snapshot
npm run backup:restore -- --yes                # actually restore the most recent snapshot
npm run backup:restore -- <timestamp> --yes    # restore a specific one
```

**Mode: merge/overwrite, never delete.** Every row in the snapshot gets written back (overwriting anything with a matching id) — but nothing that exists now and *isn't* in the snapshot gets removed. Requires `--yes` or it just prints what it would do. Cognito passwords can never be exported (Cognito doesn't expose them to anyone, including account admins) — a user that has to be recreated gets a random temporary password and must reset it on next sign-in; that's a hard Cognito limitation, not something this script can work around.

## Deploying to AWS

Push to `main` — Amplify Hosting builds and deploys automatically (`amplify.yml`). For manual backend/CLI operations, see [Amplify's deployment docs](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
