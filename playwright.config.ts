import { defineConfig, devices } from "@playwright/test";

// Runs against live production (https://main.d276q2mvykjvwc.amplifyapp.com)
// using the permanent QA fixture accounts provisioned by
// scripts/qa/provision-qa-fixture.ts — never against a local dev server,
// since the whole point is verifying what's actually deployed.
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false, // shared QA fixture data — avoid cross-test races
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [["html", { open: "never" }], ["list"]],
    timeout: 30_000,
    use: {
        baseURL: process.env.BTP_BASE_URL ?? "https://main.d276q2mvykjvwc.amplifyapp.com",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        { name: "setup", testMatch: /.*\.setup\.ts/ },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            dependencies: ["setup"],
        },
    ],
});
