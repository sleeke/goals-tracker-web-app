# Bug Tracker

This document tracks open bugs in the Goal Tracker application. Bugs are listed here until tests are created to verify the fix, at which point they should be removed.

## Open Bugs

### 1. Incorrect date is stored for retroactive progress

**Status**: Open  
**Severity**: Medium  
**Date Reported**: January 7, 2026

**Reproduction Steps**:
1. Add progress for a goal
2. Select a date in the past
3. Store the progress
4. Check the date stored by looking at the history

**Expected Behavior**: Date is as selected

**Actual Behavior**: Date is one day earlier

**Details**: This could be a time zone issue. When storing retroactive progress entries with a selected past date, the stored date is off by one day. This may be related to how the date picker sends the date (possibly as midnight UTC) versus how Firebase stores it or how the app displays it.

**Investigation Notes**:
- Check `ProgressLoggerModal.tsx` for how the date is captured from the date picker
- Check `src/services/progressService.ts` for how `logProgress()` stores the timestamp
- Consider time zone handling when converting between local time and UTC
- Test with different browser time zones

**Affected Files**:
- `src/components/ProgressLoggerModal.tsx`
- `src/services/progressService.ts`
- `src/components/ProgressHistoryModal.tsx` (displays the incorrect date)

---

## Closed Bugs

(Bugs will be moved here once verified as fixed with tests)

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
