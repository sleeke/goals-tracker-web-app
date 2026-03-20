/**
 * Playwright global setup: starts Firebase Local Emulators for CI.
 *
 * Only runs when CI=true. Starts Auth and Firestore emulators using the
 * firebase-tools binary installed in devDependencies, then creates the
 * test user account that e2e tests depend on.
 *
 * Returns a teardown function that stops the emulators after all tests finish.
 */
import { spawn } from 'child_process'
import * as path from 'path'
import type { FullConfig } from '@playwright/test'

const FIREBASE_PROJECT = 'demo-goals-tracker'
const AUTH_EMULATOR_PORT = 9099
const FIRESTORE_EMULATOR_PORT = 8080
const FAKE_API_KEY = 'fake-api-key-for-emulator'
const TEST_USER = { email: 'test@example.com', password: 'Test@12345' }

async function waitForServer(url: string, timeoutMs = 120_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url)
      return // Any HTTP response means the server is up
    } catch {
      // Connection refused — not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`[globalSetup] Server at ${url} not ready after ${timeoutMs}ms`)
}

async function globalSetup(_config: FullConfig) {
  if (!process.env.CI) {
    console.log('[globalSetup] Skipping emulator setup (not in CI)')
    return
  }

  console.log('[globalSetup] Starting Firebase emulators...')

  // firebase-tools v15+ requires Java 21. GitHub Actions runners pre-install Java 21
  // and expose its path via JAVA_HOME_21_X64. Fall back to default JAVA_HOME otherwise.
  const javaHome = process.env.JAVA_HOME_21_X64 ?? process.env.JAVA_HOME
  const spawnEnv = {
    ...process.env,
    ...(javaHome
      ? { JAVA_HOME: javaHome, PATH: `${javaHome}/bin:${process.env.PATH ?? ''}` }
      : {}),
  }
  if (javaHome) {
    console.log(`[globalSetup] Using JAVA_HOME: ${javaHome}`)
  }

  const firebaseBin = path.resolve('node_modules/.bin/firebase')
  const emulatorProcess = spawn(
    firebaseBin,
    ['emulators:start', '--only', 'auth,firestore', '--project', FIREBASE_PROJECT],
    { stdio: 'pipe', detached: false, env: spawnEnv },
  )

  emulatorProcess.stdout?.on('data', (d: Buffer) =>
    process.stdout.write(`[Emulator] ${d}`),
  )
  emulatorProcess.stderr?.on('data', (d: Buffer) =>
    process.stderr.write(`[Emulator] ${d}`),
  )
  emulatorProcess.on('error', (err) =>
    console.error('[globalSetup] Emulator process error:', err),
  )

  console.log(`[globalSetup] Waiting for Auth emulator on :${AUTH_EMULATOR_PORT}...`)
  await waitForServer(`http://localhost:${AUTH_EMULATOR_PORT}`)
  console.log('[globalSetup] Auth emulator ready')

  console.log(`[globalSetup] Waiting for Firestore emulator on :${FIRESTORE_EMULATOR_PORT}...`)
  await waitForServer(`http://localhost:${FIRESTORE_EMULATOR_PORT}`)
  console.log('[globalSetup] Firestore emulator ready')

  console.log(`[globalSetup] Creating test user (${TEST_USER.email})...`)
  const signUpUrl =
    `http://localhost:${AUTH_EMULATOR_PORT}/identitytoolkit.googleapis.com/v1/accounts:signUp` +
    `?key=${FAKE_API_KEY}`
  const resp = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...TEST_USER, returnSecureToken: true }),
  })
  const result = (await resp.json()) as { email?: string; error?: { message: string } }
  if (result.email) {
    console.log(`[globalSetup] Test user created: ${result.email}`)
  } else if (result.error) {
    throw new Error(`[globalSetup] Failed to create test user: ${result.error.message}`)
  } else {
    console.warn('[globalSetup] Unexpected result creating test user:', JSON.stringify(result))
  }

  return async () => {
    console.log('[globalTeardown] Stopping Firebase emulators...')
    emulatorProcess.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 2000))
    console.log('[globalTeardown] Done')
  }
}

export default globalSetup
