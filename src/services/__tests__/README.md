# __tests__

Unit tests for the services layer, covering business logic in isolation using [Vitest](https://vitest.dev/).

| File / Folder | Purpose |
|---|---|
| [`completedGoalsFeature.test.ts`](completedGoalsFeature.test.ts) | Tests for the completed-goals feature: goal filtering by status, sorting by completion date, expand/collapse state logic, and localStorage persistence behaviour. |
| [`progressService.test.ts`](progressService.test.ts) | Tests for the date-parsing logic used when logging retroactive progress. Verifies that HTML `<input type="date">` strings are parsed into correct local-timezone `Date` objects with no off-by-one errors. |

## Relationships

Tests in this folder cover [`../goalService.ts`](../goalService.ts) and [`../progressService.ts`](../progressService.ts). The test setup globals (mocks for `indexedDB`, `localStorage`, `matchMedia`) are configured in [`../../test/setup.ts`](../../test/setup.ts).
