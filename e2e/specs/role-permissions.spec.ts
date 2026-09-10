import { test, expect } from "@playwright/test";
import { authStatePath, type Role } from "../fixtures/qa-accounts";
import { panelHeading } from "../utils/panel";

const ALL_PANELS = ["Admin Messages", "Create Organization", "Users", "Create a user", "Create Exercise", "List Exercises", "Plans"];

interface RoleExpectation {
    role: Role;
    label: string;
    visible: string[];
}

// BTP-11/BTP-14/BTP-15/BTP-16's whole point is that these gates are real —
// each row here is a client-side mirror of a server-side rule (see
// Constants/constants.tsx canReadMessages/canCreateOrganization and
// Helpers/PermissionService.tsx's per-Profile permissions map).
const expectations: RoleExpectation[] = [
    // Note: a Cognito user with no custom:role attribute defaults to
    // "basic_user" client-side (authSlice.tsx) — the QA platform-admin
    // account has no org role at all, so it inherits basic_user's
    // permissions (viewMyPlan) on top of its platform-admin group grants.
    { role: "platform-admin", label: "platform-admin (no org role)", visible: ["Admin Messages", "Create Organization"] },
    { role: "admin-a", label: "org admin", visible: ["Users", "Create a user", "List Exercises", "Plans"] },
    { role: "trainer-a", label: "trainer (staff)", visible: ["Users", "Create a user", "Create Exercise", "List Exercises", "Plans"] },
    { role: "client-a1", label: "basic_user (client)", visible: [] },
    { role: "admin-b", label: "org admin, second org", visible: ["Users", "Create a user", "List Exercises", "Plans"] },
];

for (const { role, label, visible } of expectations) {
    test.describe(`panel visibility — ${label}`, () => {
        test.use({ storageState: authStatePath(role) });

        test(`sees exactly: ${visible.length ? visible.join(", ") : "(no admin panels)"}`, async ({ page }) => {
            await page.goto("/app/trainingMenu");
            for (const title of visible) {
                await expect(panelHeading(page, title)).toBeVisible();
            }
            for (const title of ALL_PANELS.filter((t) => !visible.includes(t))) {
                await expect(panelHeading(page, title)).toHaveCount(0);
            }
        });
    });
}

test.describe("My Plan (ViewPlan) gate", () => {
    test("basic_user sees a My Plan section; staff do not", async ({ browser }) => {
        const clientCtx = await browser.newContext({ storageState: authStatePath("client-a2") });
        const clientPage = await clientCtx.newPage();
        await clientPage.goto("/app/trainingMenu");
        const myPlanIndicator = clientPage.getByText("No plan found.").or(clientPage.locator("h3"));
        await expect(myPlanIndicator.first()).toBeVisible({ timeout: 10_000 });
        await clientCtx.close();

        const trainerCtx = await browser.newContext({ storageState: authStatePath("trainer-a") });
        const trainerPage = await trainerCtx.newPage();
        await trainerPage.goto("/app/trainingMenu");
        await expect(trainerPage.getByText("No plan found.")).toHaveCount(0);
        await trainerCtx.close();
    });
});

test.describe("List Exercises gate (BTP-23, fixed)", () => {
    // Was gated on permissions.createExercise (trainer-only), so an org
    // admin — who can see the Users list and create Plans — couldn't see
    // what exercises existed in their own org at all. Now gated on
    // canCreatePlan, matching EditPlans.tsx's own gate.
    test("admin can see the exercise catalogue", async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: authStatePath("admin-a") });
        const page = await ctx.newPage();
        await page.goto("/app/trainingMenu");
        await expect(panelHeading(page, "List Exercises")).toBeVisible();
        await ctx.close();
    });
});
