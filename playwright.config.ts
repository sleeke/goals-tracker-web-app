import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Run tests serially to avoid hangs
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid concurrency issues
  reporter: 'html',
  timeout: 30000, // 30 second timeout per test
  globalSetup: './e2e/globalSetup.ts',
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
    command: 'npm run dev:ci',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 120000, // Vite dev server + Firebase emulator startup can take up to 2 minutes
  } : undefined, // Don't start webServer in development (already running)
})
