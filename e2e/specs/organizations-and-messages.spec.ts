import { test, expect } from "@playwright/test";
import { authStatePath } from "../fixtures/qa-accounts";
import { openPanel, panelHeading } from "../utils/panel";

test.describe("Create Organization panel (BTP-16)", () => {
    test.use({ storageState: authStatePath("platform-admin") });

    test("platform-admin sees the form with all required fields", async ({ page }) => {
        await page.goto("/app/trainingMenu");
        await openPanel(page, "Create Organization");
        await expect(page.getByPlaceholder(/Org id/i)).toBeVisible();
        await expect(page.getByPlaceholder(/Org display name/i)).toBeVisible();
        await expect(page.getByPlaceholder(/admin's email/i)).toBeVisible();
        await expect(page.getByPlaceholder(/admin's name/i)).toBeVisible();
        await expect(page.getByRole("button", { name: "Create Organization", exact: true })).toBeDisabled();
    });
});

test.describe("Contact message moderation (BTP-1 / BTP-14)", () => {
    test("guest submission is visible and manageable by platform-admin only", async ({ browser }) => {
        // 1. Submit a fresh message as a guest, unauthenticated.
        const guestCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const guestPage = await guestCtx.newPage();
        await guestPage.goto("/");
        await openPanel(guestPage, "Contact Form");
        const stamp = `E2E-${Date.now()}`;
        await guestPage.fill("#name", "QA Playwright Bot");
        await guestPage.fill("#email", "mathsmechanic+qa-contact-form-test@gmail.com");
        await guestPage.fill("#message", stamp);
        const dialogPromise = guestPage.waitForEvent("dialog");
        await guestPage.getByRole("button", { name: "Submit", exact: true }).click();
        (await dialogPromise).accept();
        await guestCtx.close();

        // 2. An org admin (staff, but not platform-admin) must not see it at all.
        const adminCtx = await browser.newContext({ storageState: authStatePath("admin-a") });
        const adminPage = await adminCtx.newPage();
        await adminPage.goto("/app/trainingMenu");
        await expect(panelHeading(adminPage, "Admin Messages")).toHaveCount(0);
        await adminCtx.close();

        // 3. platform-admin can see, mark read, and delete it.
        const paCtx = await browser.newContext({ storageState: authStatePath("platform-admin") });
        const paPage = await paCtx.newPage();
        await paPage.goto("/app/trainingMenu");
        await openPanel(paPage, "Admin Messages");

        const item = paPage.locator("li", { hasText: stamp });
        await expect(item).toBeVisible({ timeout: 15_000 });
        await expect(item.getByText("Unread")).toBeVisible();

        await item.getByRole("button", { name: /Mark as Read/i }).click();
        await expect(item.getByText("Read", { exact: true })).toBeVisible();

        paPage.once("dialog", (d) => d.accept());
        await item.getByRole("button", { name: "Delete", exact: true }).click();
        await expect(paPage.locator("li", { hasText: stamp })).toHaveCount(0, { timeout: 15_000 });

        await paCtx.close();
    });
});
