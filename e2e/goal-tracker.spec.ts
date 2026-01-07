import { test, expect } from '@playwright/test'
import { TEST_USER, loginAsTestUser, logout, createGoal, logProgress } from './helpers'

const TEST_GOAL_TITLE = 'E2E Test Goal'

test.describe('Goal Tracker E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  })

  test('should complete full flow: login → create goal → log progress → verify', async ({
    page,
  }) => {
    // Step 1: Log in
    console.log('Step 1: Logging in...')
    try {
      await loginAsTestUser(page)
    } catch (loginError) {
      console.error('Login failed:', loginError)
      console.log('Current URL:', page.url())
      
      // Check for error message on page
      const errorMsg = page.locator('.error-message')
      if (await errorMsg.isVisible().catch(() => false)) {
        const errorText = await errorMsg.textContent()
        console.error('Page error:', errorText)
      }
      
      throw loginError
    }
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Goal Tracker')

    // Step 2: Ensure goal exists - create if needed
    console.log('Step 2: Checking for existing goals...')
    
    // check for goal card with title TEST_GOAL_TITLE
    const existingGoal = page.locator(`.goal-card:has-text("${TEST_GOAL_TITLE}")`).first()
    const goalExists = await existingGoal.isVisible().catch(() => false)

    if (!goalExists) {
      console.log('Step 2a: Creating test goal...')
      await createGoal(page, {
        title: TEST_GOAL_TITLE,
        description: 'Test goal for E2E validation',
        frequency: 'daily',
        target: 5,
        unit: 'units',
      })
    }

    // Step 3: Log progress
    console.log('Step 3: Logging progress...')
    await logProgress(page, TEST_GOAL_TITLE, {
      amount: 2,
      notes: 'E2E test progress entry',
    })

    // Step 4: Verify progress is stored
    console.log('Step 4: Verifying progress is stored...')
    
    // Reload page to verify data persisted
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000) // Wait for Firestore to reload and subscriptions to initialize
    
    // Goal should still be visible - use .first() to avoid strict mode violations
    const goalElement = page.locator(`.goal-card:has-text("${TEST_GOAL_TITLE}")`).first()
    await goalElement.waitFor({ state: 'visible', timeout: 5000 })
    await expect(goalElement).toBeVisible()
    
    // Check progress bar shows - just verify the progress text exists
    const progressValue = goalElement.locator('text=/\\d+ \\/ 5 units/').first()
    await progressValue.waitFor({ state: 'visible', timeout: 5000 })
    await expect(progressValue).toBeVisible()
    
    // Verify progress value
    const progressText = await progressValue.textContent()
    console.log(`Progress text: ${progressText}`)
    const progressMatch = progressText?.match(/(\d+) \/ 5/)
    const currentProgress = parseInt(progressMatch?.[1] || '0', 10)
    
    console.log(`✅ Progress verified: ${currentProgress} / 5 units`)
    
    expect(currentProgress).not.toBe(0)

    // Test complete
    console.log('✅ E2E test completed successfully!')
  })

  test('should handle goal creation with various frequencies', async ({ page }) => {
    // Login
    await loginAsTestUser(page)

    // Test creating goals with different frequencies
    const frequencies = ['daily', 'weekly', 'monthly'] as const
    
    for (const freq of frequencies) {
      const goalTitle = `${freq.charAt(0).toUpperCase() + freq.slice(1)} Goal Test ${Date.now()}`
      
      // Create goal
      await createGoal(page, {
        title: goalTitle,
        frequency: freq,
        target: 10,
      })
      
      // Verify goal appears with correct frequency label
      // Use goal-card selector to avoid modal matches, and .first() for multiple matches
      const goalCardLocator = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
      await expect(goalCardLocator).toBeVisible()
      
      // Check the frequency is displayed in the card
      const frequencyText = freq.charAt(0).toUpperCase() + freq.slice(1)
      const frequencyInCard = goalCardLocator.locator(`text=${frequencyText}`).first()
      await expect(frequencyInCard).toBeVisible()
    }

    console.log('✅ All frequency tests passed!')
  })

  test('should respect the date chosen when logging retroactive progress', async ({ page }) => {
    console.log('Testing retroactive date logging...')
    
    // Login
    await loginAsTestUser(page)
    await expect(page).toHaveURL(/.*\/dashboard/)

    // Create a goal
    const retroactiveGoalTitle = 'Retroactive Date Test Goal'
    await createGoal(page, {
      title: retroactiveGoalTitle,
      frequency: 'daily',
      target: 10,
      unit: 'units',
    })

    // Log progress on a past date (3 days ago)
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 3)
    const dateString = pastDate.toISOString().split('T')[0] // Format: YYYY-MM-DD
    
    console.log(`Logging progress for date: ${dateString}`)

    // Find the goal and click log progress
    const goalCard = page.locator(`.goal-card:has-text("${retroactiveGoalTitle}")`).first()
    await goalCard.scrollIntoViewIfNeeded()
    const logProgressBtn = goalCard.locator('button:has-text("Log Progress")')
    await logProgressBtn.click()

    // Wait for modal and fill in the form with a past date
    await page.waitForTimeout(300)
    await page.fill('input[id="amount"]', '5')
    await page.fill('input[id="logDate"]', dateString)

    // Check retroactive checkbox
    // const retroactiveCheckbox = page.locator('input[id="isRetroactive"]')
    // await retroactiveCheckbox.check()

    // Submit
    const submitBtn = page.locator('.progress-form button[type="submit"]').first()
    await submitBtn.click()

    await page.waitForTimeout(800)

    // Reload page to verify the date was persisted correctly
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Verify the goal still shows progress (it should be 0 for today since we logged it 3 days ago)
    const reloadedGoalCard = page.locator(`.goal-card:has-text("${retroactiveGoalTitle}")`).first()
    await reloadedGoalCard.waitFor({ state: 'visible', timeout: 5000 })
    
    const progressText = reloadedGoalCard.locator('text=/\\d+ \\/ 10 units/').first()
    const progressValue = await progressText.textContent()
    console.log(`Progress after reload: ${progressValue}`)
    
    // Should show 0/10 for today since we logged on a past date
    expect(progressValue).toContain('0 / 10')
    
    console.log('✅ Retroactive date logging test passed!')
  })

  test('cleanup: delete all goals to reset user data to base state', async ({ page }) => {
    console.log('🧹 Starting cleanup: deleting all goals...')
    
    // Login
    await loginAsTestUser(page)
    await expect(page).toHaveURL(/.*\/dashboard/)

    // Listen for native browser dialogs and automatically accept them
    page.on('dialog', async (dialog) => {
      console.log(`[Cleanup] Dialog detected: ${dialog.message()}`)
      await dialog.accept()
    })

    // Repeatedly delete all visible goals
    let goalsDeleted = 0
    let maxAttempts = 20 // Safety limit to prevent infinite loops

    while (maxAttempts > 0) {
      // Check if we have an empty state
      const emptyState = page.locator('text=No goals yet')
      const isEmpty = await emptyState.isVisible().catch(() => false)
      
      console.log(`[Cleanup Loop ${21 - maxAttempts}] Empty state: ${isEmpty}`)

      if (isEmpty) {
        console.log('✅ All goals deleted! User data reset to base state.')
        break
      }

      // Find and delete the first visible goal
      const firstGoalCard = page.locator('.goal-card').first()
      const isVisible = await firstGoalCard.isVisible().catch(() => false)

      if (!isVisible) {
        console.log('✅ No more visible goals. Cleanup complete.')
        break
      }

      // Find the delete button (trash icon) within the goal card
      const deleteBtn = firstGoalCard.locator('button[aria-label="Delete goal"]').first()
      
      console.log(`[Cleanup] Found delete button: ${await deleteBtn.isVisible().catch(() => false)}`)
      
      // Scroll into view and click delete
      await deleteBtn.scrollIntoViewIfNeeded()
      await deleteBtn.click()

      console.log(`[Cleanup] Clicked delete button`)

      // Wait for goal to be removed
      await page.waitForTimeout(800)
      
      goalsDeleted++
      console.log(`Deleted goal ${goalsDeleted}...`)

      maxAttempts--
    }

    await expect(goalsDeleted).toBeGreaterThan(0) // Ensure at least one goal was deleted

    console.log(`✅ Cleanup complete: ${goalsDeleted} goals deleted`)
  })
})
