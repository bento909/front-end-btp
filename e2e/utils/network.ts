import { Page } from "@playwright/test";

// AppSync serves every operation through one endpoint, so distinguishing
// "did a PlanExercise list fire" requires reading each request's GraphQL
// field name out of its POST body, not the URL.
//
// Amplify's generated client sends ANONYMOUS operations — no `query
// OperationName(...)`, just `query ($filter: ...) { listPlanExercises(...)
// {...} }` (confirmed by capturing real request bodies) — so matching for a
// name after the `query`/`mutation` keyword never finds anything. What
// actually identifies the call is the first field name inside the top-level
// selection set, i.e. the first identifier right after the opening `{`.
export function trackAppSyncOperations(page: Page) {
    const operations: string[] = [];
    page.on("request", (req) => {
        if (req.method() !== "POST" || !req.url().includes("appsync-api")) return;
        try {
            const body = req.postDataJSON();
            const query: string | undefined = body?.query;
            const match = query?.match(/\{\s*(\w+)/);
            operations.push(match?.[1] ?? "unknown");
        } catch {
            // non-JSON body (shouldn't happen for AppSync) — ignore
        }
    });
    return operations;
}
