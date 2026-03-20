# components

Reusable [React](https://react.dev/) UI components. Each component handles a single piece of the dashboard UI and receives all data via props — no direct Firebase calls.

| File / Folder | Purpose |
|---|---|
| [`CreateGoalModal.tsx`](CreateGoalModal.tsx) | Modal form for creating a new goal. Collects title, description, category, frequency (`daily`/`weekly`/`monthly`), target value, unit, priority, and colour. Calls the `onCreate` callback on submission. |
| [`EditGoalModal.tsx`](EditGoalModal.tsx) | Modal form for editing an existing goal. Pre-populates fields from the supplied `Goal` object and calls the `onSave` callback with a partial update on submission. |
| [`GoalCard.css`](GoalCard.css) | Styles for [`GoalCard.tsx`](GoalCard.tsx), including the `.goal-card--collapsed` variant used for completed goals in minimised view. |
| [`GoalCard.tsx`](GoalCard.tsx) | Displays a single goal with a progress bar, current-period and yearly progress values, and action buttons (Log Progress, Edit, History, Delete). Renders a compact collapsed view for completed goals; supports expand/collapse toggling and a "Reopen Goal" action. |
| [`GoalModal.css`](GoalModal.css) | Shared styles for modal dialogs used by `CreateGoalModal` and `EditGoalModal`. |
| [`ProgressHistoryModal.css`](ProgressHistoryModal.css) | Styles for [`ProgressHistoryModal.tsx`](ProgressHistoryModal.tsx). |
| [`ProgressHistoryModal.tsx`](ProgressHistoryModal.tsx) | Modal that lists all historical progress entries for a goal with human-friendly dates (e.g. "Today at 2:30 PM"). Allows individual entries to be deleted via `deleteProgress`. Handles Firestore `Timestamp`, plain `Date`, and string/number date formats. |
| [`ProgressLogger.css`](ProgressLogger.css) | Styles for [`ProgressLoggerModal.tsx`](ProgressLoggerModal.tsx). |
| [`ProgressLoggerModal.tsx`](ProgressLoggerModal.tsx) | Modal form for logging progress against a goal. Accepts an amount, optional notes, and a date (defaulting to today). Parses the date string using local-timezone arithmetic to avoid off-by-one errors. Calls the `onSubmit` callback with a `loggedAt` `Date` and `isRetroactive` flag. |

## Relationships

All components are assembled and orchestrated by [`../pages/DashboardPage.tsx`](../pages/DashboardPage.tsx). They import types from [`../types/index.ts`](../types/index.ts) and utility helpers from [`../utils.ts`](../utils.ts). No component calls Firebase directly.
