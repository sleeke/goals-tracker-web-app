# step_definitions

[Cucumber](https://cucumber.io/docs/cucumber/) step definition implementations that map human-readable Gherkin steps to executable [Playwright](https://playwright.dev/) browser actions.

| File / Folder | Purpose |
|---|---|
| [`steps.ts`](steps.ts) | Defines `Given`, `When`, and `Then` step hooks covering authentication, goal management, progress tracking, and reversion flows. Opens a Chromium browser before each scenario and closes it after. Most steps are currently stubs (placeholder `console.log` calls) waiting for full UI implementation. |

## Relationships

Step definitions consume the `.feature` files in [`../`](../README.md). Browser automation uses Playwright's `chromium` launcher; the app is expected to be running at `http://localhost:5173` during BDD test runs (start with `npm run dev`). Run scenarios with `npm run bdd`.
