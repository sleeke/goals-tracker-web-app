---
name: copilot-instructions
description: "Workspace-level guidance for the GitHub Copilot chat assistant tailored to this Goal Tracker project. Keep this concise — it loads into the agent's context for most developer requests."
---

# Goal Tracker — Assistant Instructions

Purpose: provide a short, consistent context so the assistant can be immediately productive with repo tasks.

**How to use:** Ask the assistant directly (e.g., "Create a failing unit test for X") or use the example prompts below.

**Project quick facts**
- **Framework:** React + Vite + TypeScript
- **Testing:** Unit: `vitest`; E2E: Playwright; BDD: Cucumber
- **Build:** `npm run build` (TypeScript build + Vite)

**Key npm scripts**
- **dev:** npm run dev → start Vite dev server
- **build:** npm run build → tsc -b && vite build
- **test:** npm run test → vitest
- **e2e:** npm run e2e → playwright test
- **bdd:** npm run bdd → cucumber-js
- **lint:** npm run lint → eslint .

**Where to look**
- High-level docs and architecture: docs/ (see 01-ARCHITECTURE.md, 02-DATA-TYPES.md)
- App entry: src/main.tsx and src/App.tsx
- Components: src/components/
- Tests: e2e/, features/, test/ and vitest config files at vitest.config.ts and playwright.config.ts
- Firebase config: config/firebase.ts and src/firebase-test.ts

Conventions & expectations
- Prefer small, focused PRs; tests for new features and regressions are required.
- Use TypeScript strictness; run `npm run type-check` before large changes.
- Follow existing component styles and CSS modules in `src/components`.

Common pitfalls
- Don't add broad `applyTo: "**"` instructions in workspace prompts — prefer file-scoped guidance.
- When editing YAML frontmatter, always use spaces (no tabs) and quote values that contain colons.

Suggested next actions for the assistant
- When asked to modify code: run the project's tests (`npm run test`) and update or add tests as part of the change.
- For UI changes: include visual test notes and update e2e or BDD scenarios if applicable.

Example prompts
- "Run unit tests and report failing suites"
- "Add a unit test for `GoalCard` that verifies completed-state styling"
- "Create a Playwright test for the create-goal flow"
- "Summarize the project's data model and where it's documented"
- "Write a short PR description for: add completed-goals feature"

If you'd like, I can also generate a companion `AGENTS.md` that defines one or two custom agents (dev/test/deploy) and example prompts; say so and I'll add it.
