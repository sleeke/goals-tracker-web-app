import { test, expect } from '@playwright/test'

test.describe('UI Checks', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
    
    // Check if login page loads
    await expect(page.locator('h1')).toContainText('Goal Tracker')
    await expect(page.locator('h2')).toContainText('Sign In')
    
    // Check form exists
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
    
    console.log('✅ Login page loads correctly')
  })
})
