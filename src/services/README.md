# services

Business-logic layer: all data access, [Firebase Firestore](https://firebase.google.com/docs/firestore) reads/writes, [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) offline storage, and pure utility functions live here. Components call these functions rather than talking to Firebase directly.

| File / Folder | Purpose |
|---|---|
| [`__tests__/`](__tests__/README.md) | Unit tests for service-layer logic (date parsing, goal filtering/sorting). |
| [`goalService.ts`](goalService.ts) | CRUD operations for goals: `getUserGoals`, `subscribeToUserGoals` (real-time listener), `createGoal`, `updateGoal`, `deleteGoal`, `reopenGoal`. All reads and writes go to the Firestore `goals` collection. |
| [`indexedDB.ts`](indexedDB.ts) | Manages the browser-side [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) database (`GoalTrackerDB`). Provides `initDB`, `saveGoalLocally`, and related helpers for storing goals, progress, and a sync queue while the device is offline. |
| [`progressService.ts`](progressService.ts) | Reads and writes progress entries to the Firestore `progress` collection: `logProgress`, `getGoalProgress`, `subscribeToGoalProgress`, `calculateGoalProgress`, `deleteProgress`. Handles retroactive entries and Firestore `Timestamp` conversions. |

## Relationships

All services import `db` from [`../config/firebase.ts`](../config/firebase.ts) and types from [`../types/index.ts`](../types/index.ts). [`DashboardPage.tsx`](../pages/DashboardPage.tsx) is the primary consumer.
