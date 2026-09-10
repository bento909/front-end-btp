import { test, expect } from "@playwright/test";
import { authStatePath, loadQaFixture } from "../fixtures/qa-accounts";
import { openPanel } from "../utils/panel";

const fixture = loadQaFixture();

test.describe("BTP-12 — listOrgUsers ownership scoping", () => {
    test.use({ storageState: authStatePath("trainer-a") });

    test("trainer sees only the client they personally created", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Users");
        await expect(page.getByText(fixture.orgA.clientOwnedByTrainer)).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(fixture.orgA.clientOwnedByAdmin)).toHaveCount(0);
        await expect(page.getByText(fixture.orgA.trainer)).toHaveCount(0); // not self-created
    });
});

test.describe("BTP-10 — cross-org isolation (org A admin)", () => {
    test.use({ storageState: authStatePath("admin-a") });

    test("sees every org A member and nothing from org B", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Users");
        for (const email of [fixture.orgA.trainer, fixture.orgA.clientOwnedByTrainer, fixture.orgA.clientOwnedByAdmin]) {
            await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });
        }
        for (const email of [fixture.orgB.admin, fixture.orgB.client]) {
            await expect(page.getByText(email)).toHaveCount(0);
        }
    });
});

test.describe("BTP-10 — cross-org isolation (org B admin)", () => {
    test.use({ storageState: authStatePath("admin-b") });

    test("sees only org B members, nothing from org A", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Users");
        await expect(page.getByText(fixture.orgB.client)).toBeVisible({ timeout: 15_000 });
        for (const email of [fixture.orgA.admin, fixture.orgA.trainer, fixture.orgA.clientOwnedByTrainer, fixture.orgA.clientOwnedByAdmin]) {
            await expect(page.getByText(email)).toHaveCount(0);
        }
    });
});
