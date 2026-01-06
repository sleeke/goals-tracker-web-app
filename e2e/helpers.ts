/**
 * Playwright test setup helper
 * Creates a test user for E2E tests
 */

export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test@12345',
  displayName: 'E2E Test User',
}

/**
 * Helper to login via UI
 */
export async function loginAsTestUser(page: any) {
  await page.goto('http://localhost:5173/')
  await page.waitForLoadState('networkidle')

  // Check if already logged in
  const dashboardVisible = await page.url().includes('/dashboard').catch(() => false)
  if (dashboardVisible) {
    return
  }

  // Fill in login form
  await page.fill('input[id="email"]', TEST_USER.email)
  await page.fill('input[id="password"]', TEST_USER.password)

  // Click login
  await page.click('button:has-text("Sign In")')

  // Wait for dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

/**
 * Helper to logout
 */
export async function logout(page: any) {
  await page.click('button:has-text("Logout")')
  await page.waitForURL('**/login', { timeout: 10000 })
}

/**
 * Helper to create a goal
 */
export async function createGoal(
  page: any,
  data: {
    title: string
    description?: string
    frequency?: 'daily' | 'weekly' | 'monthly'
    target?: number
    unit?: string
  }
) {
  // Click new goal button
  await page.click('button:has-text("New Goal")')
  await page.waitForSelector('text=Create New Goal')

  // Fill form
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

  // Submit
  await page.click('button:has-text("Create Goal")')

  // Wait for modal to close
  await page.waitForSelector('text=Create New Goal', { state: 'hidden' })

  // Wait for goal to appear
  await page.waitForSelector(`text=${data.title}`, { timeout: 10000 })
}

/**
 * Helper to log progress
 */
export async function logProgress(
  page: any,
  goalTitle: string,
  data: {
    amount: number
    notes?: string
    date?: string
  }
) {
  // Find goal and click log progress
  const goalCard = page.locator(`text=${goalTitle}`).first()
  await goalCard.scrollIntoViewIfNeeded()
  await page.click('button:has-text("Log Progress")')

  // Wait for modal
  await page.waitForSelector('text=Log Progress')

  // Fill form
  await page.fill('input[id="amount"]', data.amount.toString())

  if (data.notes) {
    await page.fill('textarea[id="notes"]', data.notes)
  }

  if (data.date) {
    await page.fill('input[id="logDate"]', data.date)
  }

  // Submit
  await page.click('button:has-text("Log Progress")')

  // Wait for modal to close
  await page.waitForSelector('text=Log Progress', { state: 'hidden' })
}
