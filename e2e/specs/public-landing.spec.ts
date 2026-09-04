import { test, expect } from "@playwright/test";
import { openPanel, panelHeading } from "../utils/panel";

// No auth — this whole suite covers the public "/" landing page, which
// carries zero role gating of its own.
test.describe("public landing page", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("loads with every public panel present", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/.+/);
        for (const title of ["Interval Timer", "Contact Form", "MIDI Clock Tracker"]) {
            await expect(panelHeading(page, title)).toBeVisible();
        }
    });

    test("interval timer panel expands and shows the editor", async ({ page }) => {
        await page.goto("/");
        await openPanel(page, "Interval Timer");
        // IntervalTimerEditor renders its own controls once open — just
        // confirm the panel body actually mounted something.
        const panel = panelHeading(page, "Interval Timer").locator("xpath=../..");
        await expect(panel.locator("input, button", { hasText: "" }).first()).toBeVisible();
    });

    test("MIDI tracker panel expands and shows live counters", async ({ page }) => {
        await page.goto("/");
        await openPanel(page, "MIDI Clock Tracker");
        await expect(page.getByText("Current Bar:")).toBeVisible();
        await expect(page.getByText("Current Beat:")).toBeVisible();
    });

    test("contact form submits a message successfully", async ({ page }) => {
        await page.goto("/");
        await openPanel(page, "Contact Form");

        const stamp = Date.now();
        await page.fill("#name", `QA Playwright Test ${stamp}`);
        await page.fill("#email", "mathsmechanic+qa-contact-form-test@gmail.com");
        await page.fill("#message", `Automated E2E test submission ${stamp}`);

        const dialogPromise = page.waitForEvent("dialog");
        await page.getByRole("button", { name: "Submit", exact: true }).click();
        const dialog = await dialogPromise;
        expect(dialog.message()).toContain("Message submitted successfully");
        await dialog.accept();

        // Form clears on success.
        await expect(page.locator("#name")).toHaveValue("");
    });

    test("contact form rejects submission with required fields empty", async ({ page }) => {
        await page.goto("/");
        await openPanel(page, "Contact Form");
        await page.getByRole("button", { name: "Submit", exact: true }).click();
        // Native HTML5 `required` validation blocks submission — no
        // network call, no dialog, still on the form with the field flagged.
        const invalid = await page.locator("#name:invalid").count();
        expect(invalid).toBe(1);
    });
});
