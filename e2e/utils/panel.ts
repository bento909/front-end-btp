import { Page, expect } from "@playwright/test";

// Every feature panel is a CollapsiblePanel: <h2>{title}</h2> next to a
// View/Close toggle button, both inside the same flex "Header" div. Locate
// the heading (the stable, semantic identifier) then reach sideways to its
// sibling button, rather than relying on styling/DOM order assumptions.
export function panelHeading(page: Page, title: string) {
    return page.getByRole("heading", { name: title, exact: true });
}

export async function panelExists(page: Page, title: string): Promise<boolean> {
    return (await panelHeading(page, title).count()) > 0;
}

export async function openPanel(page: Page, title: string) {
    const heading = panelHeading(page, title);
    await expect(heading).toBeVisible();
    const toggle = heading.locator("xpath=../button");
    const label = await toggle.textContent();
    if (label?.trim() === "View") {
        await toggle.click();
    }
    await expect(toggle).toHaveText("Close");
}

export async function closePanel(page: Page, title: string) {
    const heading = panelHeading(page, title);
    const toggle = heading.locator("xpath=../button");
    const label = await toggle.textContent();
    if (label?.trim() === "Close") {
        await toggle.click();
    }
}
