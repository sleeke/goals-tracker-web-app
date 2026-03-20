# e2e

End-to-end tests for the Goal Tracker app, written with [Playwright](https://playwright.dev/). Tests run against a live dev server at `http://localhost:5173`.

| File / Folder | Purpose |
|---|---|
| [`basic.spec.ts`](basic.spec.ts) | Smoke tests: verifies the app loads, the page URL is correct, and essential PWA `<meta>` tags (viewport, theme-color) are present. |
| [`completed-goals-simple.spec.ts`](completed-goals-simple.spec.ts) | Simplified tests for auto-completion behaviour: logs progress equal to a goal's target and asserts the goal moves to the "Completed Goals" section. Cleaner, more focused implementation of the same scenarios in `completed-goals.spec.ts`. |
| [`completed-goals.spec.ts`](completed-goals.spec.ts) | Full test suite for the completed-goals feature: auto-completion via progress logging, collapsed view, expand/collapse toggling, section visibility toggle, and `localStorage` state persistence. |
| [`goal-tracker.spec.ts`](goal-tracker.spec.ts) | Full end-to-end workflow test: login → create goal → log progress → verify dashboard state. Uses helper functions from `helpers.ts`. |
| [`helpers.ts`](helpers.ts) | Shared test utilities: `TEST_USER` credentials, `loginAsTestUser`, `logout`, `createGoal`, `logProgress`. Imports `getTodayString` from `src/utils` for consistent date formatting. |
| [`ui-check.spec.ts`](ui-check.spec.ts) | Quick UI sanity check: asserts the login page renders the correct heading, form inputs, and submit button. |

## Relationships

Tests require the app to be running before execution. In CI the server is started automatically via `playwright.config.ts` (`webServer` option). Locally, start the server first with `npm run dev`, then run `npm run e2e`.

## Usage

```bash
npm run e2e            # Run all E2E tests (headless)
npm run e2e:headed     # Run with a visible browser window
npm run e2e:debug      # Step through tests with Playwright Inspector
```
