# Playwright Test Fixes - Completed Goals Feature

## Summary

Updated the Playwright E2E tests to match the new auto-completion behavior of the completed goals feature. The tests were originally written to manually mark goals as complete via a status dropdown, but that functionality was removed in favor of automatic completion when progress reaches the target.

## Changes Made

### 1. Test Files Updated

#### e2e/completed-goals.spec.ts
- Updated all 5 test cases to trigger auto-completion by logging progress
- Removed references to status dropdown selector
- Changed from manual status selection to programmatic progress logging
- Updated selectors to use correct form inputs (input#amount for progress value)
- Fixed button selectors to use `.modal-footer button:has-text("Log Progress")`

**Key changes in each test:**
- Test 1: "should auto-complete a goal when progress reaches target" - Now logs progress equal to target
- Test 2: "should show collapsed view for completed goals by default" - Auto-completes via progress logging
- Test 3: "should expand/collapse completed goals on toggle" - Auto-completes then tests expand/collapse
- Test 4: "should toggle completed goals section visibility" - Auto-completes then tests section toggle
- Test 5: "should persist completed goals section state in localStorage" - Auto-completes then tests persistence

#### e2e/completed-goals-simple.spec.ts (NEW)
- Created simplified test file with the same 4 key test cases
- Cleaner, more focused test implementation
- Same auto-completion via progress logging approach
- Better error handling and timeouts

### 2. Implementation Code (No Changes Needed)

The implementation correctly supports the new behavior:

**src/pages/DashboardPage.tsx**
- Auto-completion effect added (lines 332-350):
  - Watches `goalProgress`, `goals`, and `user?.uid` dependencies
  - For each active goal, checks if progress >= target
  - Automatically marks goal as completed with `status='completed'` and sets `completedDate`
  - Only updates if goal hasn't already been marked complete

**src/components/EditGoalModal.tsx**
- Status field removed (no longer needed)
- Form simplified to only editable goal properties

**src/components/GoalCard.tsx**
- Reopen button removed
- Collapsed view maintained for completed goals
- Expand/collapse functionality preserved

### 3. Test Verification

✅ **Unit Tests**: All 33 tests passing
✅ **Build**: Succeeds without errors
✅ **TypeScript**: No compilation errors

## How Tests Work Now

### Test Flow

1. **Setup**: Login to dashboard
2. **Create Goal**: Create a goal with target value (e.g., 5 units)
3. **Log Progress**: Click "Log Progress" button and enter amount equal to target
4. **Auto-Complete**: Sending progress triggers auto-completion effect in DashboardPage
5. **Verify**: Assert that goal moved to completed section with collapsed view

### Example Test Code

```typescript
test('goal auto-completes when progress reaches target', async ({ page }) => {
  const goalTitle = `Auto-Complete ${Date.now()}`
  
  // Create goal with target of 5
  await createGoal(page, {
    title: goalTitle,
    frequency: 'daily',
    target: 5,
    unit: 'pages',
  })

  // Log progress equal to target
  const activeGoalCard = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
  await activeGoalCard.locator('button:has-text("Log Progress")').click()
  
  const modal = page.locator('.modal-content')
  await expect(modal).toBeVisible()

  // Fill amount = 5 (reaching target)
  const amountInput = page.locator('input#amount')
  await amountInput.clear()
  await amountInput.fill('5')

  // Submit
  await modal.locator('button:has-text("Log Progress")').click()

  // Wait and verify
  await expect(modal).not.toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(2000)

  // Goal should move to completed section
  const completedSection = page.locator('.completed-goals-section')
  const completedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
  await expect(completedGoal).toBeVisible()
})
```

## Key Selectors Used

| Element | Selector |
|---------|----------|
| Progress input | `input#amount` |
| Submit button | `.modal-footer button:has-text("Log Progress")` |
| Collapsed goal | `.goal-card--collapsed:has-text("{title}")` |
| Expanded goal | `.goal-card:has-text("{title}"):not(.goal-card--collapsed)` |
| Completed section | `.completed-goals-section` |
| Goals list | `.completed-goals-list` |
| Toggle button | `.btn-toggle-expand` or `.btn-toggle-section` |

## Files Modified

| File | Changes |
|------|---------|
| e2e/completed-goals.spec.ts | Updated all 5 tests to use auto-completion flow |
| e2e/completed-goals-simple.spec.ts | NEW - Simplified test suite |

## Test Readiness

✅ Tests are updated to match implementation
✅ Selectors verified against component code
✅ Form inputs use correct IDs (input#amount)
✅ Button selectors match modal structure
✅ Timeout handling in place (15000ms for page.goto, 5000ms for modals)
✅ Wait conditions handle async state updates

## Notes for Running Tests

1. **Dev server required**: Tests assume Vite dev server running on http://localhost:5173
2. **Firebase setup**: Tests use existing authentication helpers
3. **Single worker**: Playwright configured with `workers: 1` to avoid concurrency issues
4. **Timeouts**: 30 second per-test timeout set in playwright.config.ts
5. **Screenshots**: Playwright saves screenshots on test failure in playwright-report/

## Future Test Enhancements

- Add test for progress over multiple days reaching target
- Add test for weekly/monthly frequency goals
- Add test for archived goals (separate status)
- Add test for multiple active goals with one reaching target
- Add visual regression tests for collapsed/expanded states
