import { test, expect } from '@playwright/test'
import { TEST_USER, loginAsTestUser, logout, createGoal, logProgress } from './helpers'

const TEST_GOAL_TITLE = 'E2E Test Goal'

test.describe('Goal Tracker E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full flow: login → create goal → log progress → verify', async ({
    page,
  }) => {
    // Step 1: Log in
    console.log('Step 1: Logging in...')
    await loginAsTestUser(page)
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Goal Tracker')

    // Step 2: Ensure goal exists - create if needed
    console.log('Step 2: Checking for existing goals...')
    
    const emptyState = page.locator('text=No goals yet')
    const hasNoGoals = await emptyState.isVisible().catch(() => false)

    if (hasNoGoals) {
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
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Goal should still be visible
    await expect(page.locator(`text=${TEST_GOAL_TITLE}`)).toBeVisible()
    
    // Check progress bar shows progress
    const progressValue = page.locator('text=/\\d+ \\/ 5 units/')
    await expect(progressValue).toBeVisible()
    
    // Verify progress is at least 2
    const progressText = await progressValue.textContent()
    const progressMatch = progressText?.match(/(\d+) \/ 5/)
    const currentProgress = parseInt(progressMatch?.[1] || '0', 10)
    
    expect(currentProgress).toBeGreaterThanOrEqual(2)
    console.log(`✅ Progress verified: ${currentProgress} / 5 units`)

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
      await expect(
        page.locator(`text=${goalTitle}`).locator('..').locator(
          `text=${freq.charAt(0).toUpperCase() + freq.slice(1)}`
        )
      ).toBeVisible()
    }

    console.log('✅ All frequency tests passed!')
  })
})
