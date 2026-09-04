import { test as setup, expect } from "@playwright/test";
import { loadQaFixture, authStatePath, roleEmail, type Role } from "./fixtures/qa-accounts";

const fixture = loadQaFixture();
const roles: Role[] = ["platform-admin", "admin-a", "trainer-a", "client-a1", "client-a2", "admin-b", "client-b1"];

for (const role of roles) {
    setup(`authenticate as ${role}`, async ({ page }) => {
        const email = roleEmail(fixture, role);
        await page.goto("/app/home");
        await page.getByPlaceholder("Enter your Email").fill(email);
        await page.getByPlaceholder("Enter your Password").fill(fixture.password);
        await page.getByRole("button", { name: "Sign in", exact: true }).click();

        // Successful sign-in lands on /app/home or /app/trainingMenu depending
        // on role (PostLoginScreen always routes to trainingMenu per BTP-11) —
        // wait for the auth form itself to disappear rather than a specific URL.
        await expect(page.getByPlaceholder("Enter your Email")).toBeHidden({ timeout: 15_000 });

        await page.context().storageState({ path: authStatePath(role) });
    });
}
