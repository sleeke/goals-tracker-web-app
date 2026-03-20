# Completed Goals Feature

## Overview

The Completed Goals feature allows users to mark goals as completed, which moves them to a separate, collapsible section at the bottom of the dashboard. Completed goals are displayed in a minimized (collapsed) view by default, and can be expanded individually. Users can also "reopen" completed goals to move them back to the active goals section.

## Implementation Details

### Data Model

Goals now have two new fields:
- **status**: `'active' | 'archived' | 'completed'` - The current state of the goal
- **completedDate**: `Date` (optional) - The date when the goal was marked as completed

### Components & Features

#### 1. EditGoalModal (`src/components/EditGoalModal.tsx`)
- Added status dropdown field allowing users to mark goals as 'active', 'archived', or 'completed'
- When a goal is saved with status='completed', the completedDate is automatically set to the current date
- When reopening a completed goal (status='active'), completedDate is cleared

#### 2. GoalCard (`src/components/GoalCard.tsx`)
- Added collapsed view rendering when `isCollapsed={true}` and `status='completed'`
- Collapsed view shows:
  - Goal title
  - Completion date ("Completed Jan 14, 2026")
  - Expand button (▶) to toggle expanded view
- Expanded view shows all goal details with a collapse button (▼)
- Footer button changes based on status:
  - Active goals: "Log Progress" button
  - Completed goals: "Reopen Goal" button

#### 3. DashboardPage (`src/pages/DashboardPage.tsx`)
- Separates goals into `activeGoals` and `completedGoals` based on status
- Completed goals are sorted by completedDate in descending order (most recent first)
- Shows "Completed Goals" section only when completed goals exist
- Section header shows count and toggle button to collapse/expand section
- localStorage persistence for:
  - Section visibility state (`goal-tracker-show-completed-section`)
  - Expanded/collapsed state of individual completed goals (`goal-tracker-expanded-completed-goals`)

### Services

#### goalService (`src/services/goalService.ts`)
- **updateGoal()**: Already supports status and completedDate fields
- **reopenGoal()**: Changes goal status from 'completed' to 'active' and clears completedDate
- **completeGoal()**: Sets status to 'completed' and sets completedDate

### Styling

#### GoalCard.css
- `.goal-card--collapsed`: Compact horizontal layout for collapsed view
- `.collapsed-content`: Flexbox container for compact display
- `.collapsed-title-section`: Title and date container
- `.collapsed-title`: Goal title in collapsed view
- `.collapsed-date`: Completion date display
- `.btn-toggle-expand`: Toggle expand/collapse button

#### DashboardPage.css
- `.completed-goals-section`: Container for completed goals
- `.completed-goals-header`: Header with title and toggle button
- `.completed-goals-list`: Grid layout for completed goal cards
- `.btn-toggle-section`: Toggle visibility button

## User Workflow

### To Mark a Goal as Completed

1. Click the edit button (✏️) on a goal card
2. In the modal, select "Completed" from the status dropdown
3. Click Save
4. Goal is moved to the "Completed Goals" section, displayed in collapsed view

### To View Completed Goal Details

1. Click the expand button (▶) on a collapsed completed goal
2. Goal expands to show full details including progress bars and history

### To Reopen a Completed Goal

1. Expand the completed goal (if collapsed)
2. Click "Reopen Goal" button
3. Goal moves back to the active goals section

### To Hide/Show Completed Goals Section

1. Click the toggle button (▼/▶) in the "Completed Goals" header
2. Section visibility is persisted to localStorage

## State Persistence

The feature uses localStorage to persist:

| Key | Value | Example |
|-----|-------|---------|
| `goal-tracker-show-completed-section` | `'true'` or `'false'` | Whether section is visible |
| `goal-tracker-expanded-completed-goals` | Comma-separated goal IDs | `'goal-1,goal-3,goal-5'` |

## Testing

Unit tests for the completed goals feature logic are in `src/services/__tests__/completedGoalsFeature.test.ts`, covering:

- Goal filtering and sorting by status
- Collapsed/expanded state management
- localStorage persistence and serialization
- Goal status and completion date handling
- Collapsed vs expanded card display logic

All 20 tests pass successfully.

## Files Modified

1. `src/pages/DashboardPage.tsx` - Added state and handlers for completed goals
2. `src/components/GoalCard.tsx` - Added collapsed view rendering and reopen button
3. `src/components/GoalCard.css` - Added collapsed view styles
4. `src/pages/DashboardPage.css` - Added completed goals section styles
5. `src/components/EditGoalModal.tsx` - Added status field and completedDate handling
6. `src/services/__tests__/completedGoalsFeature.test.ts` - New comprehensive unit tests

## Future Enhancements

- Add filtering options (show only this year's completed goals, etc.)
- Bulk operations (reopen multiple goals, archive multiple completed goals)
- Statistics dashboard showing completion rates and trends
- Goal completion notifications
- Ability to view completed goal history after reopening
