# Copilot Instruction Set — Per Query

Goal:
- Implement requested change, prioritize creating failing tests first, then fix, then verify.

Process (must follow, in order):
1. Clarify: If requirements ambiguous, ask exactly 1 clarifying question before changing code.
2. Create tests first:
   - Unit tests that capture the logic change (fast, deterministic).
   - E2E Playwright tests that exercise the user-visible behavior.
3. Run tests locally:
   - Install deps: `npm ci`
   - Run unit tests: `npm test` (or `npm run test:unit` if available)
   - Run Playwright tests: `npx playwright test` (or `npm run e2e`)
4. Implement minimal code changes to satisfy tests.
5. Re-run tests and fix until all pass.
6. Lint/build: `npm run build` (if exists) and `npm run lint` (if exists).
7. Commit with message: `feat(scope): short description` or `fix(scope): short description`.
8. Open PR with summary of tests added and how to run them locally.

Failure handling:
- If unit tests fail: create/expand unit tests to isolate cause, fix implementation, re-run.
- If Playwright tests fail: capture trace/screenshot, run in headed mode locally for debugging.

Local commands:
- Install: `npm ci`
- Unit: `npm test` or `npm run test:unit`
- Playwright: `npx playwright test` or `npm run e2e`
- Run both: `npm run test:ci` (if script exists)

CI expectations:
- All PRs must run unit tests and Playwright tests before merge.

Notes:
- Keep changes minimal and well-tested.
- Prefer writing tests that reproduce the bug precisely before implementing fixes.
- Persist any UI state required for user flows to localStorage where specified.