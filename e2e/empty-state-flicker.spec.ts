/**
 * Regression test: empty-state flicker on dashboard load / first goal creation.
 *
 * Two failure modes are covered:
 *
 * 1. INITIAL-LOAD FLICKER
 *    When the dashboard mounts and Firestore is slow, the loading placeholder
 *    must stay visible until the first snapshot arrives. The empty state must
 *    never appear while `isLoading` is true.
 *
 * 2. FIRST-GOAL CREATION FLICKER (the bug that survives the fb782d7 fix)
 *    `handleCreateGoal`'s `finally` block calls `setIsLoading(false)` before
 *    the Firestore subscription delivers the new goal. This creates a window
 *    where `isLoading=false` AND `goals=[]` → empty state briefly shown.
 *
 * Both tests assert that the empty state is NEVER visible during the
 * dangerous window. On the current code (pre-fix) the second test FAILS,
 * producing the regression evidence requested.
 */

import { test, expect } from '@playwright/test'
import { loginAsTestUser, createGoal } from './helpers'

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Inject a fetch/XHR wrapper that delays any request whose URL matches a
 * Firestore endpoint (production *or* emulator) by `delayMs` milliseconds.
 * Must be called before the navigation whose loading window we want to probe.
 */
async function injectFirestoreDelay(page: import('@playwright/test').Page, delayMs: number) {
  await page.addInitScript((ms: number) => {
    // ── fetch wrapper ──────────────────────────────────────────────────────
    const _origFetch = window.fetch
    window.fetch = async function (input, init) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.href
          : (input as Request).url
      if (
        url.includes('firestore.googleapis.com') ||
        url.includes(':8080') // emulator
      ) {
        await new Promise<void>((resolve) => setTimeout(resolve, ms))
      }
      return _origFetch.call(window, input, init)
    }

    // ── XMLHttpRequest wrapper ─────────────────────────────────────────────
    const _origOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('firestore.googleapis.com') || urlStr.includes(':8080')) {
        ;(this as XMLHttpRequest & { _fsDelay?: number })._fsDelay = ms
      }
      return (_origOpen as Function).call(this, method, url, ...rest)
    }

    const _origSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      const self = this as XMLHttpRequest & { _fsDelay?: number }
      if (self._fsDelay) {
        setTimeout(() => (_origSend as Function).call(self, body), self._fsDelay)
      } else {
        ;(_origSend as Function).call(this, body)
      }
    }
  }, delayMs)
}

// ── tests ──────────────────────────────────────────────────────────────────

test.describe('Empty-state flicker regression', () => {
  /**
   * TEST 1 — Initial-load flicker
   *
   * Artificially delay Firestore responses, then navigate to /dashboard.
   * Within the 800 ms delay window the loading placeholder must be visible
   * and the empty state must NOT be visible.
   *
   * On correctly fixed code this test PASSES.
   * If the initial-load guard is broken (isLoading starts false, or is reset
   * to false before the subscription fires) this test FAILS.
   */
  test('loading placeholder is shown — not empty state — while Firestore is slow', async ({
    page,
  }) => {
    // Log in (no delay yet – let auth complete normally)
    await loginAsTestUser(page)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // Ensure the test user has at least one goal so that "no goals yet" would
    // be wrong to display during loading.
    const goalCount = await page.locator('.goal-card').count()
    if (goalCount === 0) {
      await createGoal(page, {
        title: 'Flicker Test Baseline Goal',
        frequency: 'daily',
        target: 1,
        unit: 'rep',
      })
      await expect(page.locator('.goal-card').first()).toBeVisible({ timeout: 10_000 })
    }

    // Register the Firestore delay – applies to the NEXT navigation.
    await injectFirestoreDelay(page, 800)

    // Reload the dashboard. Auth state is in localStorage so the user is
    // still authenticated; only the Firestore goal-fetch is delayed.
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    // Screenshot for evidence (captured within the ~800 ms loading window)
    await page.screenshot({
      path: 'test-results/flicker-test-initial-load.png',
      fullPage: true,
    })

    const emptyStateNoGoals = page.locator('text=No goals yet')
    const loadingPlaceholder = page.locator('.loading-placeholder')

    // ── REGRESSION ASSERTION ────────────────────────────────────────────────
    // Empty state must NOT be visible while Firestore is delayed.
    await expect(emptyStateNoGoals).not.toBeVisible({ timeout: 200 })

    // The loading placeholder SHOULD be visible (confirms we're inside the
    // loading window where the fix must hold).
    await expect(loadingPlaceholder).toBeVisible({ timeout: 200 })

    // Wait for goals to eventually load (delay resolves after 800 ms)
    await page.waitForSelector('.goal-card', { timeout: 5_000 })

    // After goals load the empty state must still be absent
    await expect(emptyStateNoGoals).not.toBeVisible()
  })

  /**
   * TEST 2 — First-goal-creation flicker  ← THIS IS THE FAILING TEST
   *
   * When a user creates their very first goal, handleCreateGoal's `finally`
   * block calls setIsLoading(false) BEFORE the Firestore onSnapshot delivers
   * the new goal. This creates a window where isLoading=false && goals=[] →
   * the empty state is rendered.
   *
   * Strategy: we clear all existing goals so the test starts from zero,
   * trigger a goal creation, and assert the empty state never appears between
   * the moment the "Create" button is clicked and the moment the new goal card
   * becomes visible.
   *
   * On the CURRENT CODE (before the fix) this test FAILS because the empty
   * state flashes in that window. After the fix it PASSES.
   */
  test('empty state does not flash when creating the first goal', async ({ page }) => {
    await loginAsTestUser(page)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    // ── Step 1: ensure zero goals ──────────────────────────────────────────
    // Delete every existing goal so we start from a known-empty state.
    // (We iterate because deletions are one at a time.)
    let attempts = 0
    while (attempts < 20) {
      const cards = page.locator('.goal-card')
      const count = await cards.count()
      if (count === 0) break

      // Open the first goal card's delete / edit controls.
      // Try clicking an edit button then deleting from the modal, or use
      // a direct delete affordance if available.
      const firstCard = cards.first()

      // Look for a delete button on the card
      const deleteBtn = firstCard.locator('button[aria-label*="delete" i], button:has-text("Delete")')
      if (await deleteBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await deleteBtn.click()
        // Handle confirmation dialog if present
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")')
          .filter({ hasNot: page.locator('.goal-card') }) // not inside a card
        if (await confirmBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await confirmBtn.click()
        }
      } else {
        // Fall back: open edit modal and delete from there
        const editBtn = firstCard.locator('button[aria-label*="edit" i], button:has-text("Edit")')
        if (await editBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
          await editBtn.click()
          const modalDeleteBtn = page
            .locator('.modal-content, [role="dialog"]')
            .locator('button:has-text("Delete")')
          if (await modalDeleteBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await modalDeleteBtn.click()
            const confirmDelete = page.locator('button:has-text("Confirm"), button:has-text("Yes")')
            if (await confirmDelete.isVisible({ timeout: 1_000 }).catch(() => false)) {
              await confirmDelete.click()
            }
          } else {
            // Cannot find delete – close and break to avoid infinite loop
            await page.keyboard.press('Escape')
            break
          }
        } else {
          break
        }
      }

      await page.waitForTimeout(500)
      attempts++
    }

    // If we couldn't empty the board, skip (rather than give a false pass/fail)
    const remaining = await page.locator('.goal-card').count()
    if (remaining > 0) {
      test.skip(true, 'Could not clear existing goals; skipping first-goal flicker test')
      return
    }

    // Confirm empty state is shown correctly before we start
    await expect(page.locator('text=No goals yet')).toBeVisible({ timeout: 3_000 })

    // ── Step 2: open the Create-Goal modal ────────────────────────────────
    await page.click('button:has-text("New Goal")')
    await page.waitForSelector('.modal-content, [role="dialog"]', { timeout: 5_000 })

    // Fill in the form
    const dialog = page.locator('.modal-content, [role="dialog"]').first()
    await dialog.locator('input[name="title"], input[placeholder*="title" i], input[id="title"]').fill('First Goal Ever')

    // ── Step 3: Submit and immediately watch for empty-state flicker ───────
    // We start monitoring for the "No goals yet" text BEFORE clicking Create.
    // If it ever becomes hidden THEN visible again after submission, that is
    // the flicker. We collect a sequence of visibility observations.
    const emptyState = page.locator('text=No goals yet')

    // Click Create
    await dialog.locator('button:has-text("Create"), button[type="submit"]').click()

    // ── REGRESSION ASSERTION ────────────────────────────────────────────────
    // Between clicking "Create" and the new goal card appearing, the empty
    // state must NOT become visible. On buggy code it WILL flash here because
    // handleCreateGoal's finally block sets isLoading=false before the
    // Firestore subscription fires.
    //
    // We wait up to 3 s for the goal card; during that window we continuously
    // poll for the empty state.
    let flickerDetected = false
    const pollHandle = setInterval(() => {
      // This closure runs in Node (Playwright) — async DOM access is
      // not directly possible here. We use a Playwright assertion approach
      // below instead.
    }, 50)
    clearInterval(pollHandle) // We use the assertion approach instead

    // The new goal card should appear within 5 s
    const goalCardLocator = page.locator('.goal-card')

    // Screenshot before the card appears for evidence
    await page.screenshot({
      path: 'test-results/flicker-test-after-create-click.png',
      fullPage: true,
    })

    // The empty state must NOT be visible at any moment while we wait for the card
    // We use a short polling loop via Playwright's built-in retry
    const startTime = Date.now()
    while (Date.now() - startTime < 3_000) {
      const isEmptyStateVisible = await emptyState.isVisible().catch(() => false)
      if (isEmptyStateVisible) {
        flickerDetected = true
        // Screenshot at the moment of flicker for evidence
        await page.screenshot({
          path: 'test-results/flicker-detected-during-create.png',
          fullPage: true,
        })
        break
      }
      const isGoalCardVisible = await goalCardLocator.isVisible().catch(() => false)
      if (isGoalCardVisible) break
      await page.waitForTimeout(30)
    }

    // Confirm goal eventually appears
    await expect(goalCardLocator.first()).toBeVisible({ timeout: 5_000 })

    // Final assertion: no flicker was detected
    expect(flickerDetected, 'Empty state flashed during first-goal creation').toBe(false)
  })
})
