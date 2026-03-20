# Bug Tracker

This document tracks open bugs in the Goal Tracker application. Bugs are listed here until tests are created to verify the fix, at which point they should be removed.

## Open Bugs

### N. Failing tests

**Status**: Open  
**Severity**: Critical  

**Reproduction Steps**:
1. Run all tests using `npm run publish`

**Expected Behavior**: All tests should pass

**Actual Behavior**: Some tests fail due to recent changes

**Details**: None

**Affected Files**:
- completed-goals.spec.ts
- goal-tracker.spec.ts

### N. Script doesn't kill all instances of the server

**Status**: Open  
**Severity**: Low  

**Reproduction Steps**:
1. Start some servers using `npm run dev`, potentially in the background
1. Run all tests using `npm run publish`

**Expected Behavior**: All servers should be killed

**Actual Behavior**: In some cases, the other instances will not be destroyed

**Details**: This may be due to the servers being started in the background, and could be solved by running through the pids produced by the `pgrep -af "npm run dev"` command

**Affected Files**:
- [test-and-publish.sh](../scripts/test-and-publish.sh)

### N. Goals marked as complete are not unmarked if the history is removed

**Status**: Open  
**Severity**: Medium  

**Reproduction Steps**:
1. Create and fulfil a goal
1. Remove the progress history
1. Reresh the page

**Expected Behavior**: The goal will no longer be marked as completed, and will expand and move to the active goals section

**Actual Behavior**: The goal remains marked as completed

**Details**: There shouldn't be any state to the goals when it comes to completion - when the page is refreshed the state should be calculated based on the progress towards the goal. It's not certain if this state is persisted between sessions and won't reset the following day - this needs to be confirmed.

**Affected Files**:
- ??


---

## Resolved Bugs

### Date/Time Preservation in Progress Logging

**Status**: Fixed
**Severity**: Medium
**Date Reported**: 2026-01-08
**Date Fixed**: 2026-01-14

**Issue**: Progress entries were always showing with a timestamp of 12:00am (midnight), regardless of when the user actually logged the progress.

**Root Cause**: In `ProgressLoggerModal.tsx`, the timestamp was being set to midnight for all progress entries:
```typescript
const loggedDate = new Date(year, month - 1, day, 0, 0, 0, 0)
```

**Fix Applied**: Modified `ProgressLoggerModal.tsx` to:
- For current progress (not retroactive): Use the actual current time to preserve the time of day when the user logged the progress
- For retroactive progress: Continue to use midnight as it represents "sometime during that past day"

**Tests Added**: Added comprehensive tests in `progressService.test.ts` to verify:
- Current progress entries preserve the time of day
- Retroactive entries use midnight of the selected date
- Multiple entries on the same day can have different times

**Files Modified**:
- `src/components/ProgressLoggerModal.tsx` - Fixed timestamp logic
- `src/services/__tests__/progressService.test.ts` - Added tests to verify fix

---

## Bug Report Template

When adding a new bug, use this template:

```markdown
### N. Bug Title

**Status**: Open  
**Severity**: Low/Medium/High/Critical  
**Date Reported**: YYYY-MM-DD

**Reproduction Steps**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Details**: Additional context or investigation notes

**Affected Files**:
- File 1
- File 2
```

---

## Severity Levels

- **Critical**: App crashes or data loss
- **High**: Feature doesn't work at all
- **Medium**: Feature works but with incorrect behavior
- **Low**: Minor issue, cosmetic or rarely encountered
