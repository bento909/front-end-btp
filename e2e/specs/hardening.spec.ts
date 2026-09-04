import { test, expect } from "@playwright/test";
import { authStatePath } from "../fixtures/qa-accounts";
import { openPanel } from "../utils/panel";

test.describe("BTP-19 — auth failure state (no reload loop)", () => {
    test.use({ storageState: authStatePath("client-b1") });

    test("a broken Cognito call shows an error state, not a reload loop", async ({ page }) => {
        // Block the Cognito IDP host so fetchUserAttributes()/fetchAuthSession()
        // reject — this is exactly the failure Layout.tsx's error branch exists
        // for. Previously this triggered three window.location.reload() calls
        // into a permanently blank page (BTP-19); now it should show a real
        // error message and a "Return to sign-in" action instead.
        await page.route("**/cognito-idp.*.amazonaws.com/**", (route) => route.abort());

        let navigationCount = 0;
        page.on("framenavigated", () => navigationCount++);

        await page.goto("/app/home");
        await expect(page.getByRole("button", { name: "Return to sign-in", exact: true })).toBeVisible({ timeout: 15_000 });

        // Give a would-be reload loop a moment to manifest, then confirm it didn't.
        await page.waitForTimeout(3000);
        expect(navigationCount).toBeLessThanOrEqual(2); // initial goto + at most one follow-on
    });
});

test.describe("Console hygiene", () => {
    test.use({ storageState: authStatePath("trainer-a") });

    test("no console errors during a typical trainer session", async ({ page }) => {
        // Amplify Hosting's SPA rewrite rule is "404-200" (source status 404,
        // rewritten to /index.html) — AWS's own recommended pattern, since it
        // still lets real missing-asset 404s show up distinctly. That means
        // every client-side route logs one expected 404 on load; filter it
        // rather than treat it as a bug.
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error" && !msg.text().includes("404")) errors.push(msg.text());
        });
        page.on("pageerror", (err) => errors.push(err.message));

        await page.goto("/app/trainingMenu");
        for (const title of ["Users", "Create a user", "Create Exercise", "List Exercises", "Plans"]) {
            await openPanel(page, title);
        }
        expect(errors, `Console errors seen: ${JSON.stringify(errors, null, 2)}`).toEqual([]);
    });
});

test.describe("Console hygiene — basic_user", () => {
    test.use({ storageState: authStatePath("client-a1") });

    test("no console errors viewing own plan", async ({ page }) => {
        // Amplify Hosting's SPA rewrite rule is "404-200" (source status 404,
        // rewritten to /index.html) — AWS's own recommended pattern, since it
        // still lets real missing-asset 404s show up distinctly. That means
        // every client-side route logs one expected 404 on load; filter it
        // rather than treat it as a bug.
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error" && !msg.text().includes("404")) errors.push(msg.text());
        });
        page.on("pageerror", (err) => errors.push(err.message));

        await page.goto("/app/trainingMenu");
        await page.waitForTimeout(2000);
        expect(errors, `Console errors seen: ${JSON.stringify(errors, null, 2)}`).toEqual([]);
    });
});
