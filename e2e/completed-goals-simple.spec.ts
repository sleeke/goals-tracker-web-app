import { test, expect } from '@playwright/test'
import { loginAsTestUser, createGoal } from './helpers'

test.describe('Completed Goals - Auto-Completion Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (baseURL is configured in playwright.config.ts)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    
    // Login
    await loginAsTestUser(page)
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test('goal auto-completes when progress reaches target', async ({ page }) => {
    const goalTitle = `Auto-Complete ${Date.now()}`
    
    // Create goal with target of 5
    await createGoal(page, {
      title: goalTitle,
      frequency: 'daily',
      target: 5,
      unit: 'pages',
    })

    // Wait for goal to appear
    const activeGoalCard = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
    await expect(activeGoalCard).toBeVisible()

    // Click "Log Progress"
    await activeGoalCard.locator('button:has-text("Log Progress")').click()
    
    // Wait for modal
    const modal = page.locator('.modal-content')
    await expect(modal).toBeVisible()

    // Fill amount = 5 (reaching target)
    const amountInput = page.locator('input#amount')
    await amountInput.clear()
    await amountInput.fill('5')

    // Submit
    await modal.locator('button:has-text("Log Progress")').click()

    // Wait for modal to close and state to update
    await expect(modal).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(2000)

    // Goal should move to completed section
    const completedSection = page.locator('.completed-goals-section')
    await expect(completedSection).toBeVisible()

    const completedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    await expect(completedGoal).toBeVisible()
  })

  test('completed goal shows in collapsed view', async ({ page }) => {
    const goalTitle = `Collapsed View ${Date.now()}`
    
    // Create and complete a goal
    await createGoal(page, {
      title: goalTitle,
      frequency: 'daily',
      target: 3,
      unit: 'miles',
    })

    const activeGoal = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
    await activeGoal.locator('button:has-text("Log Progress")').click()

    const modal = page.locator('.modal-content')
    const amountInput = page.locator('input#amount')
    await amountInput.clear()
    await amountInput.fill('3')
    await modal.locator('button:has-text("Log Progress")').click()

    await expect(modal).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(2000)

    // Check collapsed view elements
    const completedSection = page.locator('.completed-goals-section')
    const collapsedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    
    await expect(collapsedGoal).toBeVisible()
    await expect(collapsedGoal.locator('.collapsed-title')).toContainText(goalTitle)
    await expect(collapsedGoal.locator('.collapsed-date')).toContainText('Completed')
    await expect(collapsedGoal.locator('.btn-toggle-expand')).toBeVisible()
  })

  test('can expand and collapse completed goal', async ({ page }) => {
    const goalTitle = `Expand Toggle ${Date.now()}`
    
    // Create and complete a goal
    await createGoal(page, {
      title: goalTitle,
      frequency: 'daily',
      target: 2,
      unit: 'units',
    })

    const activeGoal = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
    await activeGoal.locator('button:has-text("Log Progress")').click()

    const modal = page.locator('.modal-content')
    const amountInput = page.locator('input#amount')
    await amountInput.clear()
    await amountInput.fill('2')
    await modal.locator('button:has-text("Log Progress")').click()

    await expect(modal).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(2000)

    // Find collapsed goal
    const completedSection = page.locator('.completed-goals-section')
    const collapsedGoal = completedSection.locator(`.goal-card--collapsed:has-text("${goalTitle}")`)
    
    // Expand it
    await collapsedGoal.locator('.btn-toggle-expand').click()
    await page.waitForTimeout(500)

    // Should no longer have collapsed class
    const expandedGoal = completedSection.locator(`.goal-card:has-text("${goalTitle}"):not(.goal-card--collapsed)`)
    await expect(expandedGoal).toBeVisible()

    // Should show progress bar
    await expect(expandedGoal.locator('.progress-bar-fill')).toBeVisible()
  })

  test('completed goals section can be toggled', async ({ page }) => {
    const goalTitle = `Section Toggle ${Date.now()}`
    
    // Create and complete a goal
    await createGoal(page, {
      title: goalTitle,
      frequency: 'daily',
      target: 4,
      unit: 'hours',
    })

    const activeGoal = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
    await activeGoal.locator('button:has-text("Log Progress")').click()

    const modal = page.locator('.modal-content')
    const amountInput = page.locator('input#amount')
    await amountInput.clear()
    await amountInput.fill('4')
    await modal.locator('button:has-text("Log Progress")').click()

    await expect(modal).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(2000)

    // Verify section is visible
    const goalsList = page.locator('.completed-goals-list')
    await expect(goalsList).toBeVisible()

    // Click toggle button
    const toggleBtn = page.locator('.btn-toggle-section')
    await toggleBtn.click()
    await page.waitForTimeout(500)

    // List should be hidden
    await expect(goalsList).not.toBeVisible()

    // Toggle again
    await toggleBtn.click()
    await page.waitForTimeout(500)

    // List should be visible again
    await expect(goalsList).toBeVisible()
  })
})
