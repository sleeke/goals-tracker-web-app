/**
 * Playwright test setup helper
 * Creates a test user for E2E tests
 */

import type { Page } from '@playwright/test'
import { getTodayString } from "../src/utils"

export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test@12345',
  displayName: 'E2E Test User',
}

/**
 * Helper to login via UI
 */
export async function loginAsTestUser(page: Page) {
  console.log('[LOGIN] Navigating to app...')
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)

  // Check if already logged in
  const currentUrl = page.url()
  console.log('[LOGIN] Current URL:', currentUrl)
  
  if (currentUrl.includes('/dashboard')) {
    console.log('[LOGIN] Already on dashboard')
    return
  }

  console.log('[LOGIN] Filling in login form...')
  try {
    // Fill in login form
    await page.fill('input[id="email"]', TEST_USER.email, { timeout: 5000 })
    await page.fill('input[id="password"]', TEST_USER.password, { timeout: 5000 })

    // Click login
    console.log('[LOGIN] Clicking Sign In button...')
    await page.click('button:has-text("Sign In")', { timeout: 5000 })

    // Wait for dashboard with a timeout
    console.log('[LOGIN] Waiting for dashboard redirect...')
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 })
      console.log('[LOGIN] Successfully redirected to dashboard')
    } catch (urlWaitError) {
      console.error('[LOGIN] Failed to redirect to dashboard:', urlWaitError)
      
      // Check if there's an error message displayed
      const errorElement = page.locator('.error-message')
      const errorVisible = await errorElement.isVisible().catch(() => false)
      
      if (errorVisible) {
        const errorText = await errorElement.textContent()
        console.error('[LOGIN] Login error displayed:', errorText)
        throw new Error(`Login failed: ${errorText}`)
      }
      
      throw new Error(`Login redirect timeout - test user may not exist. Create account with email: ${TEST_USER.email}`)
    }

    await page.waitForTimeout(500)

    console.log('[LOGIN] Login complete')
  } catch (err) {
    console.error('[LOGIN] Login error:', err)
    throw err
  }
}

/**
 * Helper to logout
 */
export async function logout(page: Page) {
  await page.click('button:has-text("Logout")')
  await page.waitForURL('**/login', { timeout: 10000 })
}

/**
 * Helper to create a goal
 */
export async function createGoal(
  page: Page,
  data: {
    title: string
    description?: string
    frequency?: 'daily' | 'weekly' | 'monthly'
    target?: number
    unit?: string
  }
) {
  console.log(`[CREATE_GOAL] Creating goal: "${data.title}"`)
  // Click new goal button
  await page.click('button:has-text("New Goal")')
  
  console.log('[CREATE_GOAL] Waiting for modal...')
  await page.waitForTimeout(300) // Brief wait for modal animation

  // Fill form
  console.log('[CREATE_GOAL] Filling form...')
  await page.fill('input[id="title"]', data.title)

  if (data.description) {
    await page.fill('textarea[id="description"]', data.description)
  }

  if (data.frequency) {
    await page.selectOption('select[id="frequency"]', data.frequency)
  }

  if (data.target) {
    await page.fill('input[id="targetValue"]', data.target.toString())
  }

  if (data.unit) {
    await page.fill('input[id="unit"]', data.unit)
  }

  // Submit form
  console.log('[CREATE_GOAL] Submitting form...')
  await page.click('button:has-text("Create Goal")')

  console.log('[CREATE_GOAL] Waiting for goal to appear...')
  // Wait for goal to be created and visible
  await page.waitForTimeout(500) // Wait for creation and re-render
  
  // Verify goal exists by checking if we can see it in the goal card (not modal)
  // Use .first() to avoid strict mode violations when multiple goals have same title
  const goalCard = page.locator(`.goal-card:has-text("${data.title}")`).first()
  await goalCard.waitFor({ state: 'visible', timeout: 10000 })
  
  console.log('[CREATE_GOAL] Goal created successfully')
}

/**
 * Helper to log progress
 */
export async function logProgress(
  page: Page,
  goalTitle: string,
  data: {
    amount: number
    notes?: string
    date?: string
  }
) {
  console.log(`[LOG_PROGRESS] Logging progress for goal: "${goalTitle}"`)
  
  // Find the goal card with this title
  const goalCard = page.locator(`.goal-card:has-text("${goalTitle}")`).first()
  await goalCard.scrollIntoViewIfNeeded()
  
  // Find the Log Progress button within the goal card
  const logProgressBtn = goalCard.locator('button:has-text("Log Progress")')
  
  console.log('[LOG_PROGRESS] Clicking Log Progress button...')
  await logProgressBtn.click()

  console.log('[LOG_PROGRESS] Waiting for modal...')
  await page.waitForTimeout(300) // Wait for modal animation

  // Fill form
  console.log('[LOG_PROGRESS] Filling progress form...')
  await page.fill('input[id="amount"]', data.amount.toString())

  if (data.notes) {
    await page.fill('textarea[id="notes"]', data.notes)
  }

  // Check that date is today's date by default if not provided
  const dateInput = page.locator('input[id="logDate"]')
  const dateValue = await dateInput.inputValue()

  const todayStr = getTodayString()

  // compare field content to today's date
  if (dateValue !== todayStr) {
    throw new Error(`[LOG_PROGRESS] Expected default log date to be today (${todayStr}), but got ${dateValue}`)
  }

  if (data.date) {
    await page.fill('input[id="logDate"]', data.date)
  }

  // Submit form - click the submit button inside the modal form
  console.log('[LOG_PROGRESS] Submitting progress form...')
  // Use the modal's submit button specifically
  const submitBtn = page.locator('.progress-form button[type="submit"]').first()
  await submitBtn.click()

  console.log('[LOG_PROGRESS] Waiting for progress to be recorded...')
  await page.waitForTimeout(800) // Wait for Firestore operation
  
  console.log('[LOG_PROGRESS] Progress logged successfully')
}

