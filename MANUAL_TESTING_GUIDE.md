# Manual Testing Guide: Completed Goals Feature

This guide walks through manually testing the Completed Goals feature in the Goal Tracker application.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (default: http://localhost:5173)

3. Log in with your Firebase credentials or create a test account

4. Have at least one active goal created (create one if needed)

## Test Scenarios

### Scenario 1: Mark a Goal as Completed

**Steps:**
1. View the dashboard with one or more active goals
2. Click the edit button (✏️) on any active goal
3. In the Edit Goal modal, locate the "Status" dropdown (middle column, below target value)
4. Change status from "Active" to "Completed"
5. Click "Save"

**Expected Results:**
- ✅ Goal disappears from the "Your Goals" (active goals) section
- ✅ A new "Completed Goals (1)" section appears at the bottom
- ✅ The completed goal is shown in a minimized/collapsed view with:
  - Goal title
  - "Completed [Month Day, Year]" text
  - Expand button (▶)
- ✅ The completion date is automatically set to today's date

**Example Collapsed View:**
```
┌─ Completed Goals (1) ▼ ─────────────────┐
│  My Goal                Completed Jan 14, 2026  ▶ │
└──────────────────────────────────────────┘
```

### Scenario 2: Expand Completed Goal

**Prerequisites:** 
- Complete Scenario 1 first (have a completed goal)

**Steps:**
1. In the "Completed Goals" section, locate the collapsed goal
2. Click the expand button (▶) on the collapsed goal

**Expected Results:**
- ✅ Goal expands to full view showing:
  - Goal title and description
  - Color indicator
  - Progress bar and values
  - Yearly progress
  - All action buttons (Edit, History, Delete)
  - Collapse button (▼) at top
  - "Reopen Goal" button at bottom (instead of "Log Progress")
- ✅ Collapse button (▼) appears in the header

**Example Expanded View:**
```
┌─ Color │ Goal Title          ▼ ✏️ 📋 🗑️ ─┐
│ Description text...                     │
│ Progress: ████████░░ 80%  |  100/125    │
│ 📊 Yearly: 1200 units                  │
│                                         │
│              [ Reopen Goal ] [Completed]│
└─────────────────────────────────────────┘
```

### Scenario 3: Collapse Expanded Goal

**Prerequisites:**
- Complete Scenario 2 (have expanded goal)

**Steps:**
1. Click the collapse button (▼) in the expanded goal's header

**Expected Results:**
- ✅ Goal collapses back to minimized view
- ✅ Shows title and completion date again
- ✅ Shows expand button (▶) again

### Scenario 4: Reopen Completed Goal

**Prerequisites:**
- Have a completed goal in the "Completed Goals" section

**Steps:**
1. If goal is collapsed, expand it first by clicking the expand button (▶)
2. Click "Reopen Goal" button at the bottom
3. Confirm the action in the dialog that appears

**Expected Results:**
- ✅ Confirmation dialog appears: "Move this goal back to Active? You can continue tracking progress."
- ✅ After confirmation:
  - Goal is removed from "Completed Goals" section
  - Goal reappears in the main "Your Goals" active goals grid
  - Goal status is changed to "Active"
  - Completion date is cleared
  - "Log Progress" button appears instead of "Reopen Goal"
- ✅ If the "Completed Goals" section has no more goals, section disappears

### Scenario 5: Toggle Completed Goals Section Visibility

**Prerequisites:**
- Have at least one completed goal

**Steps:**
1. In the "Completed Goals" section header, click the toggle button (▼)

**Expected Results:**
- ✅ Section content collapses
- ✅ Toggle button changes to (▶)
- ✅ Completed goals are hidden but section header remains visible
2. Click the toggle button (▶) again

**Expected Results:**
- ✅ Section content expands
- ✅ Completed goals are visible again
- ✅ Toggle button changes back to (▼)

### Scenario 6: Multiple Completed Goals with Sorting

**Steps:**
1. Mark multiple goals as completed at different times (or manually edit dates if possible)
2. View the "Completed Goals" section

**Expected Results:**
- ✅ Completed goals are sorted with most recent completion date first
- ✅ Section header shows count: "Completed Goals (N)"
- ✅ All goals display in collapsed view by default

### Scenario 7: localStorage Persistence

**Steps:**
1. Create some completed goals and expand a few of them
2. Hide the "Completed Goals" section by clicking the toggle
3. Refresh the page (F5 or Cmd+R)

**Expected Results:**
- ✅ Page reloads with same state preserved:
  - Same goals still completed
  - "Completed Goals" section is still hidden
  - Previously expanded goals remain expanded
  - Previously collapsed goals remain collapsed
- ✅ No loss of state across page refreshes

### Scenario 8: Edit Completed Goal

**Prerequisites:**
- Have a completed goal (collapsed or expanded)

**Steps:**
1. Click edit button (✏️) on a completed goal
2. Change some goal properties (title, description, target value, etc.)
3. Keep status as "Completed"
4. Click Save

**Expected Results:**
- ✅ Goal updates in the "Completed Goals" section
- ✅ Changes are reflected immediately
- ✅ Completion date remains unchanged
- ✅ Goal remains in "Completed Goals" section

### Scenario 9: Delete Completed Goal

**Prerequisites:**
- Have a completed goal

**Steps:**
1. Click delete button (🗑️) on a completed goal (expand first if collapsed)
2. Confirm deletion in the dialog

**Expected Results:**
- ✅ Confirmation dialog appears: 'Are you sure you want to delete "[Goal Title]"?'
- ✅ After confirmation:
  - Goal is removed from "Completed Goals" section
  - If last completed goal, section disappears
  - Goal no longer appears anywhere in the app

### Scenario 10: Mixed Active and Completed Goals

**Steps:**
1. Have both active and completed goals in the app
2. Review the dashboard layout

**Expected Results:**
- ✅ "Your Goals" section displays active goals in grid layout
- ✅ "Completed Goals" section appears below with completed goals
- ✅ Sections are visually distinct
- ✅ Both sections work independently (toggling one doesn't affect the other)

## Edge Cases to Test

### Edge Case 1: Complete All Goals
1. Mark all active goals as completed

**Expected Result:**
- ✅ Main grid shows empty state message: "No active goals. Create one to get started!"
- ✅ All goals in "Completed Goals" section

### Edge Case 2: Empty Completed Section
1. Reopen all completed goals back to active

**Expected Result:**
- ✅ "Completed Goals" section disappears entirely
- ✅ All goals back in active grid

### Edge Case 3: Bulk Toggle Collapse
1. Have multiple expanded completed goals
2. Close the "Completed Goals" section and reopen it

**Expected Result:**
- ✅ All goals return to their previous collapsed/expanded states
- ✅ localStorage persistence maintained

### Edge Case 4: Rapid Toggle
1. Rapidly click expand/collapse buttons

**Expected Result:**
- ✅ No errors or glitches
- ✅ State updates correctly
- ✅ localStorage updates correctly

## Browser DevTools Verification

### localStorage Check:
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Application → localStorage
3. Look for your app's origin
4. Check for keys:
   - `goal-tracker-show-completed-section` (should be 'true' or 'false')
   - `goal-tracker-expanded-completed-goals` (should be comma-separated goal IDs or empty)

### Console Check:
1. Open DevTools Console tab
2. There should be no error messages
3. You might see info messages about goal updates

## Test Checklist

- [ ] Mark goal as completed (Scenario 1)
- [ ] Expand collapsed goal (Scenario 2)
- [ ] Collapse expanded goal (Scenario 3)
- [ ] Reopen completed goal (Scenario 4)
- [ ] Toggle section visibility (Scenario 5)
- [ ] Test with multiple goals (Scenario 6)
- [ ] Verify localStorage persistence (Scenario 7)
- [ ] Edit completed goal (Scenario 8)
- [ ] Delete completed goal (Scenario 9)
- [ ] Test mixed active/completed (Scenario 10)
- [ ] Test edge case: all goals completed (Edge Case 1)
- [ ] Test edge case: no completed goals (Edge Case 2)
- [ ] Test edge case: collapse state persistence (Edge Case 3)
- [ ] Test edge case: rapid toggles (Edge Case 4)
- [ ] Verify localStorage keys (Browser DevTools)
- [ ] Check for console errors (Browser DevTools)

## Known Limitations

1. **Timezone Display**: Completion date uses browser's local timezone
2. **Bulk Operations**: Cannot select/reopen multiple goals at once
3. **Sorting**: Only sorted by completion date, not by other criteria
4. **Date Precision**: Completion date is set to current date only (not specific time)

## Troubleshooting

**Problem:** Completed goals section not appearing
- Solution: Make sure you actually marked a goal as "Completed" and saved it
- Check browser console for errors

**Problem:** Expanded goals collapsing on page refresh
- Solution: Check localStorage in browser DevTools to ensure keys are being saved

**Problem:** Status dropdown not appearing in Edit modal
- Solution: Ensure you're on the latest code build (`npm run build`)

**Problem:** Reopen not working
- Solution: Check browser console for errors, ensure you have confirmed the dialog
