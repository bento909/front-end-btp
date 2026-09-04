import { test, expect } from "@playwright/test";
import { loadQaFixture } from "../fixtures/qa-accounts";

// Deliberately fresh (unauthenticated) sessions for every test here — this
// covers the sign-in flow itself, distinct from auth.setup.ts which performs
// the same login mechanically to produce storage states for every other spec.
test.describe("authentication", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("sign-up is disabled — no Create Account option", async ({ page }) => {
        await page.goto("/app/home");
        await expect(page.getByPlaceholder("Enter your Email")).toBeVisible();
        await expect(page.getByRole("tab", { name: /create account/i })).toHaveCount(0);
        await expect(page.getByRole("link", { name: /create account/i })).toHaveCount(0);
    });

    test("invalid credentials show an error and do not sign in", async ({ page }) => {
        await page.goto("/app/home");
        await page.getByPlaceholder("Enter your Email").fill("mathsmechanic+qa-nonexistent@gmail.com");
        await page.getByPlaceholder("Enter your Password").fill("WrongPassword123!");
        await page.getByRole("button", { name: "Sign in", exact: true }).click();
        await expect(page.getByText(/incorrect|error|not exist/i)).toBeVisible({ timeout: 10_000 });
        await expect(page.getByPlaceholder("Enter your Email")).toBeVisible();
    });

    test("valid sign-in reaches the app, and sign-out returns to a signed-out state", async ({ page }) => {
        const fixture = loadQaFixture();
        await page.goto("/app/home");
        await page.getByPlaceholder("Enter your Email").fill(fixture.orgA.trainer);
        await page.getByPlaceholder("Enter your Password").fill(fixture.password);
        await page.getByRole("button", { name: "Sign in", exact: true }).click();

        await expect(page.getByRole("heading", { name: /^Hello, / })).toBeVisible({ timeout: 15_000 });

        await page.getByRole("button", { name: "Logout", exact: true }).click();
        await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    });
});
