import { test, expect, Page, Locator } from "@playwright/test";
import { authStatePath, loadQaFixture } from "../fixtures/qa-accounts";
import { openPanel } from "../utils/panel";
import { trackAppSyncOperations } from "../utils/network";

const fixture = loadQaFixture();
const EXERCISE_NAME = "QA Automated Test Exercise";

async function dragListItem(page: Page, scope: Locator, fromText: string, toText: string) {
    // `scope` (exerciseRows) is already the collection of <li> rows itself —
    // filter it directly, don't search for nested <li> descendants within
    // each row (there are none, which silently resolves to zero matches).
    const source = scope.filter({ hasText: fromText }).first();
    const target = scope.filter({ hasText: toText }).first();
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("Could not locate drag source/target bounding boxes");
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2 + 10, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();
}

test.describe("Plans & Exercises — trainer flow (BTP-2/5/6/7/11/13)", () => {
    test.describe.configure({ mode: "serial" });
    test.use({ storageState: authStatePath("trainer-a") });

    test("creates the shared QA test exercise (idempotent)", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "List Exercises");
        if (await page.getByText(EXERCISE_NAME, { exact: true }).count() > 0) {
            return; // already exists from a prior run
        }
        await openPanel(page, "Create Exercise");
        await page.getByPlaceholder("Exercise Name").fill(EXERCISE_NAME);
        await page.locator("select").first().selectOption({ label: "Lift Weight" });
        await page.getByPlaceholder("Tips (optional)").fill("Created by the automated E2E suite — safe to leave in place.");
        await page.getByRole("button", { name: "Create Exercise", exact: true }).click();
        await expect(page.getByText(`Created exercise: ${EXERCISE_NAME}`)).toBeVisible({ timeout: 15_000 });
    });

    test("creates a Week Plan for the owned client (idempotent)", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Plans");
        await page.getByRole("button", { name: fixture.orgA.clientOwnedByTrainer }).click();

        // PlanLoader's fetch is async — wait for it to actually resolve into
        // either PlanCreator's or PlanEditor's rendered state before reading
        // .count() (which, unlike expect(), doesn't auto-wait and can read a
        // stale/premature 0 while the fetch is still in flight).
        const weekPlanBtn = page.getByRole("button", { name: "Create Week Plan", exact: true });
        await expect(weekPlanBtn.or(page.getByRole("button", { name: /^Monday/ }))).toBeVisible({ timeout: 15_000 });

        if (await weekPlanBtn.count() > 0) {
            // "Create Week Plan" is the mode-select (sets planType="WEEK",
            // doesn't create anything yet); "Confirm: Create Week Plan" is
            // the distinctly-labeled button that actually creates the plan
            // (BTP-25 — these used to share one identical label).
            await weekPlanBtn.click();
            await page.getByRole("button", { name: "Confirm: Create Week Plan", exact: true }).click();
            await expect(page.getByRole("heading", { level: 4 })).toBeVisible({ timeout: 15_000 });
        }
        // 7 day rows, Monday..Sunday, regardless of whether we just created it
        // or it already existed from a prior run.
        for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
            await expect(page.getByRole("button", { name: new RegExp(`^${day}`) })).toBeVisible({ timeout: 15_000 });
        }
    });

    test("adds two exercise instances to Monday, edits one, reorders, then deletes both (self-cleaning)", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Plans");
        await page.getByRole("button", { name: fixture.orgA.clientOwnedByTrainer }).click();
        await page.getByRole("button", { name: /^Monday/ }).click();

        // The client/day/exercise rows are all rendered as <li>, nested
        // inside each other — a plain `page.locator("li", {hasText})` also
        // matches the ancestor client/day rows (their text content includes
        // every descendant's text too), which only "worked" by accident with
        // a single exercise on the day. `.filter({has: ...})` doesn't help
        // either — it matches any ancestor whose subtree contains the
        // button, not just the direct container (so it grabs the outer
        // client <li> too, pulling in all 7 days). Get the Monday button
        // itself (unique) and go to its own direct parent <li> instead.
        const mondayRow = page.getByRole("button", { name: /^Monday/ }).locator("xpath=..");
        const exerciseRows = mondayRow.locator("ul li");

        async function addInstance(reps: string, weight: string, sets: string) {
            await page.getByLabel("Exercise Type:").selectOption({ label: "Lift Weight" });
            await page.getByLabel("Exercise:").selectOption({ label: EXERCISE_NAME });
            await page.getByLabel("Reps:").fill(reps);
            await page.getByLabel("Weight (Kg):").fill(weight);
            await page.getByLabel("Sets:").fill(sets);
            await page.getByRole("button", { name: "Add Exercise", exact: true }).click();
        }

        await addInstance("8", "40", "4");
        await expect(page.getByText("8 Reps, 40 Kg, 4")).toBeVisible({ timeout: 15_000 });

        await addInstance("6", "30", "3");
        await expect(page.getByText("6 Reps, 30 Kg, 3")).toBeVisible({ timeout: 15_000 });

        // Edit the first instance's values. Reference it by position, not
        // hasText — Playwright locators re-evaluate lazily on each action,
        // and once "Edit" is clicked the row's display text disappears
        // entirely (replaced by bare inputs with no "Reps"/"Kg" text), so a
        // hasText-based locator stops matching mid-interaction. Position is
        // stable: "8 Reps..." was added first (order=1), so it's exerciseRows
        // index 0, and editing doesn't reorder or remount the <li>.
        const firstRow = exerciseRows.nth(0);
        await firstRow.getByRole("button", { name: "Edit", exact: true }).click();
        await firstRow.getByPlaceholder("Reps").fill("10");
        await firstRow.getByRole("button", { name: "Save", exact: true }).click();
        await expect(firstRow).toContainText("10 Reps, 40 Kg, 4", { timeout: 15_000 });

        // Reorder: drag the "6 Reps" row above the "10 Reps" row.
        await dragListItem(page, exerciseRows, "6 Reps, 30 Kg, 3", "10 Reps, 40 Kg, 4");
        await expect(exerciseRows.first()).toContainText("6 Reps", { timeout: 15_000 });

        // Clean up both instances so this test stays repeatable.
        for (const label of ["6 Reps, 30 Kg, 3", "10 Reps, 40 Kg, 4"]) {
            const row = exerciseRows.filter({ hasText: label });
            if (await row.count() > 0) {
                await row.getByRole("button", { name: "Delete", exact: true }).click();
                await expect(exerciseRows.filter({ hasText: label })).toHaveCount(0, { timeout: 15_000 });
            }
        }
    });

    test("BTP-7 regression: exercises are only fetched for a day once it's expanded", async ({ page }) => {
        const operations = trackAppSyncOperations(page);
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Plans");
        await page.getByRole("button", { name: fixture.orgA.clientOwnedByTrainer }).click();
        await expect(page.getByRole("button", { name: /^Monday/ })).toBeVisible({ timeout: 15_000 });

        expect(operations.filter((o) => o === "listPlanExercises")).toHaveLength(0);

        await page.getByRole("button", { name: /^Monday/ }).click(); // expand
        await expect(page.getByText(/No exercises|Reps,/)).toBeVisible({ timeout: 15_000 });
        expect(operations.filter((o) => o === "listPlanExercises")).toHaveLength(1);

        await page.getByRole("button", { name: /^Tuesday/ }).click(); // expand a second day
        await expect(page.locator("li", { hasText: /^Tuesday/ }).getByText(/No exercises|Reps,/)).toBeVisible({ timeout: 15_000 });
        expect(operations.filter((o) => o === "listPlanExercises")).toHaveLength(2);

        await page.getByRole("button", { name: /^Monday/ }).click(); // collapse Monday
        await page.getByRole("button", { name: /^Monday/ }).click(); // re-expand Monday
        // Cached (loadedDayIds) — collapsing and re-expanding must not re-fetch.
        expect(operations.filter((o) => o === "listPlanExercises")).toHaveLength(2);
    });
});

test.describe("Plans — custom-length plan (BTP-5)", () => {
    test.use({ storageState: authStatePath("admin-a") });

    test("admin creates a 3-day custom plan for the admin-owned client (idempotent)", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Plans");
        await page.getByRole("button", { name: fixture.orgA.clientOwnedByAdmin }).click();

        const customBtn = page.getByRole("button", { name: "Create Custom Days Plan", exact: true });
        await expect(customBtn.or(page.getByRole("button", { name: /^Day 1/ }))).toBeVisible({ timeout: 15_000 });

        if (await customBtn.count() > 0) {
            await customBtn.click();
            await page.getByRole("spinbutton").fill("3");
            await page.getByRole("button", { name: "Create Custom Plan", exact: true }).click();
            await expect(page.getByRole("heading", { level: 4 })).toBeVisible({ timeout: 15_000 });
        }
        await expect(page.getByRole("button", { name: /^Day 1/ })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole("button", { name: /^Day 2/ })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole("button", { name: /^Day 3/ })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole("button", { name: /^Day 4/ })).toHaveCount(0);
    });
});

test.describe("Plans & Exercises — client's own view (BTP-7 lazy loading, ViewPlan)", () => {
    test.use({ storageState: authStatePath("client-a1") });

    test("client sees their plan and can expand a day to load and log an exercise", async ({ page }) => {
        const operations = trackAppSyncOperations(page);
        await page.goto("/app/trainingMenu");

        // Today's day auto-expands — exactly one listPlanExercises call, not
        // one per day of the week.
        await expect(page.getByRole("heading", { level: 3 })).toBeVisible({ timeout: 15_000 });
        await page.waitForTimeout(1000);
        expect(operations.filter((o) => o === "listPlanExercises").length).toBeLessThanOrEqual(1);
    });
});
