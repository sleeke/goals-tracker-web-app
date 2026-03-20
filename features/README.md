# features

[Cucumber](https://cucumber.io/docs/cucumber/) [Gherkin](https://cucumber.io/docs/gherkin/reference/) feature files that describe the application's expected behaviour in plain English. These serve as living specification documents and are executed as BDD tests via `npm run bdd`.

| File / Folder | Purpose |
|---|---|
| [`authentication-sync.feature`](authentication-sync.feature) | Scenarios covering user sign-up, login, logout, cross-device sync, and offline authentication flows. |
| [`goal-management.feature`](goal-management.feature) | Scenarios for creating, editing, deleting, and archiving goals with various configurations (frequency, target, category). |
| [`progress-reversion.feature`](progress-reversion.feature) | Scenarios for reverting accidental progress entries: undo recent changes, view audit trail, and selective deletion. |
| [`progress-tracking.feature`](progress-tracking.feature) | Scenarios for logging progress against a goal, viewing current-period and yearly totals, and progress bar display. |
| [`reporting-analytics.feature`](reporting-analytics.feature) | Scenarios for the year-to-date dashboard, period summaries, and trend visualisations. |
| [`retroactive-logging.feature`](retroactive-logging.feature) | Scenarios for logging progress entries with custom past dates/times and verifying they are attributed to the correct period. |
| [`step_definitions/`](step_definitions/README.md) | TypeScript step definition implementations that execute each Gherkin step using Playwright. |

## Relationships

Feature files are consumed by the Cucumber runner configured in [`../cucumber.js`](../cucumber.js). Step implementations are in [`step_definitions/`](step_definitions/README.md). Run with `npm run bdd`; the app must be running at `http://localhost:5173`.
