import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL || (process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173')

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Run tests serially to avoid hangs
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid concurrency issues
  reporter: 'html',
  timeout: 30000, // 30 second timeout per test
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.CI ? {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60000,
  } : undefined, // Don't start webServer in development (already running)
})
