import { test, expect } from '@playwright/test'
import { loginAsTestUser, createGoal } from './helpers'

test.describe('Completed Goals Feature', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Navigate to the app (baseURL is configured in playwright.config.ts)
    await page.goto(baseURL || 'http://localhost:5173/', { waitUntil: 'domcontentloaded' })
    
    // Login
    await loginAsTestUser(page)
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Goal Tracker')
  })

  test('should auto-complete a goal when progress reaches target', async ({
    page,
  }) => {
    const goalTitle = `Auto-Complete Test Goal ${Date.now()}`

    // Create a new goal with target of 5
    await createGoal(page, {
      title: goalTitle,
      description: 'Test goal for auto-completion',
      frequency: 'daily',
      target: 5,
      unit: 'pages',
    })

    // Verify goal is created and visible in active goals
    const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`)
    await expect(goalCard).toBeVisible()

    // Log progress equal to target (5 pages)
    await goalCard.locator('button:has-text("Log Progress")').click()
    
    // Modal should open
    await expect(page.locator('.modal-content')).toBeVisible()
    
    // Fill in progress value (match target of 5)
    const amountInput = page.locator('input#amount')
    await amountInput.fill('5')
    
    // Submit - look for "Log Progress" button in modal footer
    await page.locator('.modal-footer button:has-text("Log Progress")').click()
    
    // Wait for modal to close and goal to update
    await expect(page.locator('.modal-content')).not.toBeVisible()
    await page.waitForTimeout(1000)

    // Completed Goals section should now be visible
    const completedSection = page.locator('.completed-goals-section')
    await expect(completedSection).toBeVisible()

    // Section header should show "Completed Goals"
    const sectionHeader = page.locator('.completed-goals-header h3')
    await expect(sectionHeader).toContainText('Completed Goals')

    // Completed goals section should contain the goal (in collapsed view)
    const completedGoalCard = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    await expect(completedGoalCard).toBeVisible()
  })

  test('should show collapsed view for completed goals by default', async ({
    page,
  }) => {
    const goalTitle = `Minimize Test Goal ${Date.now()}`

    // Create a new goal with target of 3
    await createGoal(page, {
      title: goalTitle,
      description: 'Test goal for collapse feature',
      frequency: 'daily',
      target: 3,
      unit: 'units',
    })

    // Log progress to reach target (3 units)
    const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`)
    await goalCard.locator('button:has-text("Log Progress")').click()
    
    await expect(page.locator('.modal-content')).toBeVisible()
    
    const amountInput = page.locator('input#amount')
    await amountInput.fill('3')
    
    await page.locator('.modal-footer button:has-text("Log Progress")').click()
    
    await expect(page.locator('.modal-content')).not.toBeVisible()
    await page.waitForTimeout(1000)

    // Find the completed goal in the section
    const completedSection = page.locator('.completed-goals-section')
    const completedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    
    // Should be in collapsed state
    await expect(completedGoal).toBeVisible()
    
    // Collapsed card should show title and completion date
    const collapsedTitle = completedGoal.locator('.collapsed-title')
    await expect(collapsedTitle).toContainText(goalTitle)
    
    // Should show completion date
    const completedDate = completedGoal.locator('.collapsed-date')
    await expect(completedDate).toContainText('Completed')
    
    // Should have toggle button
    const toggleButton = completedGoal.locator('.btn-toggle-expand')
    await expect(toggleButton).toBeVisible()
  })

  test('should expand/collapse completed goals on toggle', async ({
    page,
  }) => {
    const goalTitle = `Toggle Test Goal ${Date.now()}`

    // Create a goal with target of 2
    await createGoal(page, {
      title: goalTitle,
      description: 'Test goal for toggle',
      frequency: 'daily',
      target: 2,
      unit: 'units',
    })

    // Log progress to reach target
    const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`)
    await goalCard.locator('button:has-text("Log Progress")').click()
    
    await expect(page.locator('.modal-content')).toBeVisible()
    
    const amountInput = page.locator('input#amount')
    await amountInput.fill('2')
    
    await page.locator('.modal-footer button:has-text("Log Progress")').click()
    await page.waitForTimeout(1000)

    const completedSection = page.locator('.completed-goals-section')
    const collapsedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    
    // Should start collapsed
    await expect(collapsedGoal).toHaveClass(/goal-card--collapsed/)
    
    // Click expand button
    const toggleButton = collapsedGoal.locator('.btn-toggle-expand')
    await toggleButton.click()
    
    await page.waitForTimeout(500)
    
    // After expanding, the card no longer has goal-card--collapsed class, so use
    // a class-independent locator to assert the expanded state
    const expandedGoal = completedSection.locator(`.goal-card:has-text("${goalTitle}")`)
    await expect(expandedGoal).not.toHaveClass(/goal-card--collapsed/)
    
    // Should show full content now
    const progressBar = expandedGoal.locator('.progress-bar-fill')
    await expect(progressBar).toBeVisible()
  })

  test('should toggle completed goals section visibility', async ({ page }) => {
    const goalTitle = `Section Toggle Test ${Date.now()}`

    // Create a goal with target of 4
    await createGoal(page, {
      title: goalTitle,
      description: 'Test goal for section toggle',
      frequency: 'daily',
      target: 4,
      unit: 'units',
    })

    // Log progress to reach target
    const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`)
    await goalCard.locator('button:has-text("Log Progress")').click()
    
    await expect(page.locator('.modal-content')).toBeVisible()
    
    const amountInput = page.locator('input#amount')
    await amountInput.fill('4')
    
    await page.locator('.modal-footer button:has-text("Log Progress")').click()
    await page.waitForTimeout(1000)

    // Completed goals should be visible
    const completedGoalsList = page.locator('.completed-goals-list')
    await expect(completedGoalsList).toBeVisible()

    // Click section toggle button
    const toggleSectionButton = page.locator('.btn-toggle-section')
    await toggleSectionButton.click()
    
    await page.waitForTimeout(500)

    // Completed goals list should be hidden
    await expect(completedGoalsList).not.toBeVisible()
    
    // Section header should still be visible
    await expect(page.locator('.completed-goals-header')).toBeVisible()

    // Click toggle again to show
    await toggleSectionButton.click()
    
    await page.waitForTimeout(500)

    // Completed goals list should be visible again
    await expect(completedGoalsList).toBeVisible()
  })

  test('should persist completed goals section state in localStorage', async ({ page }) => {
    const goalTitle = `Persistence Test Goal ${Date.now()}`

    // Create a goal and complete it by reaching target
    await createGoal(page, {
      title: goalTitle,
      description: 'Test goal for localStorage persistence',
      frequency: 'daily',
      target: 6,
      unit: 'units',
    })

    // Log progress to reach target
    const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`)
    await goalCard.locator('button:has-text("Log Progress")').click()
    
    await expect(page.locator('.modal-content')).toBeVisible()
    
    const amountInput = page.locator('input#amount')
    await amountInput.fill('6')
    
    await page.locator('.modal-footer button:has-text("Log Progress")').click()
    await page.waitForTimeout(1000)

    // Hide completed goals section
    const toggleSectionButton = page.locator('.btn-toggle-section')
    await toggleSectionButton.click()
    
    await page.waitForTimeout(500)

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    // Completed goals list should still be hidden
    const completedGoalsList = page.locator('.completed-goals-list')
    await expect(completedGoalsList).not.toBeVisible()

    // Toggle again to verify it works after reload
    await toggleSectionButton.click()
    
    await page.waitForTimeout(500)
    
    // Should be visible again
    await expect(completedGoalsList).toBeVisible()
  })
})
