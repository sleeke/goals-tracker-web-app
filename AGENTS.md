# AGENTS.md

Quick reference for all AI agents available in this repository. Agents are defined in `.github/agents/` and are invoked via the GitHub Copilot agent framework.

## Quick Reference

| Agent | File | Purpose | When to Use |
|---|---|---|---|
| [architect](#architect) | `architect.agent.md` | Audits codebase architecture against documented standards | After a significant feature lands; before a release |
| [code-reviewer](#code-reviewer) | `code-reviewer.agent.md` | Reviews code changes for quality, correctness, and standards | Before merging a PR or after implementation |
| [deployer](#deployer) | `deployer.agent.md` | Runs the deployment pipeline | After quality gate passes |
| [designer](#designer) | `designer.agent.md` | Proposes and implements visual redesigns | When UI/UX changes are needed |
| [feature-delivery](#feature-delivery) | `feature-delivery.agent.md` | End-to-end feature workflow (spec → implement → test → document → deploy) | Delivering a new feature |
| [implementer](#implementer) | `implementer.agent.md` | Writes code to implement specifications | When a spec exists and code needs writing |
| [mentor](#mentor) | `mentor.agent.md` | Analyses a session to extract lessons learned | After completing a feature or fixing a bug |
| [orchestrator](#orchestrator) | `orchestrator.agent.md` | Routes user intent to the correct workflow agent | When unsure which agent to use |
| [quality-gate](#quality-gate) | `quality-gate.agent.md` | Runs the full CI suite and fixes failures automatically | Before deployment; after implementation |
| [refactor](#refactor) | `refactor.agent.md` | Restructures code without changing behaviour | When improving code structure |
| [release-manager](#release-manager) | `release-manager.agent.md` | Coordinates production releases | Releasing a new version to production |
| [scribe](#scribe) | `scribe.agent.md` | Creates and maintains README.md files across the repo | After code changes; full documentation passes |
| [spec-expander](#spec-expander) | `spec-expander.agent.md` | Expands a one-liner requirement into a detailed spec | Before starting implementation of any feature |

---

## Agent Details

### architect

Audits the codebase against [`copilot-instructions.md`](.github/copilot-instructions.md), framework best practices, and general software-engineering principles.

**When to use:**
- After a significant feature is added
- Before preparing a release
- When architectural drift is suspected

**Output:** A Markdown report at `agent-output/Architect-Review.md` covering violations, best-practice gaps, and improvement opportunities, categorised by severity.

**Example prompts:**
- *"Run an architectural review of the codebase."*
- *"Audit the src/services/ folder against our coding standards."*

---

### code-reviewer

Reviews code changes for quality, correctness, adherence to project standards, and potential bugs.

**When to use:**
- Before merging a pull request
- After the implementer completes a task
- For a second opinion on a complex change

**Example prompts:**
- *"Review the changes in src/components/GoalCard.tsx."*
- *"Code review the progress tracking implementation."*

---

### deployer

Tier 3 specialist that runs the deployment pipeline (`npm run publish`) and reports the outcome. Assumes CI gates are already green unless told otherwise.

**When to use:**
- After the quality gate passes
- When you want to ship the current build to Firebase Hosting

**Example prompts:**
- *"Deploy the current build to Firebase Hosting."*
- *"Run the deployment pipeline."*

---

### designer

Full-scope creative director and front-end design agent. Proposes and implements holistic visual redesigns — backgrounds, animations, typography, layered UI, imagery, component composition, and colour — across the entire site.

**Modes:**
1. **Site-wide redesign** — Analyses the current site, proposes a complete visual direction, and implements it end-to-end.
2. **Targeted refinement** — Tweaks specific aspects (colour, animation, backgrounds) across affected files.
3. **Inspiration-driven redesign** — Fetches and analyses a reference website, then adapts its patterns to this project.

**When to use:**
- When the UI needs a visual refresh
- When implementing a specific design change (colours, layout, typography)
- When you have a reference site to draw inspiration from

**Example prompts:**
- *"Redesign the dashboard to feel more modern."*
- *"Update the colour scheme to use a blue-green palette."*
- *"Redesign inspired by [URL]."*

---

### feature-delivery

Tier 2 workflow agent that coordinates end-to-end feature delivery: expand spec → implement → quality gate → document → deploy.

**When to use:**
- Delivering a new feature from a one-liner requirement through to production
- When you want a fully automated delivery pipeline

**Example prompts:**
- *"Deliver the 'weekly goal reset' feature."*
- *"Implement the backlog item 'Recent Progress chart' end-to-end."*

---

### implementer

Writes production code to satisfy a specification. Reads the spec from `specs/` and implements the required changes.

**When to use:**
- After a spec has been created by `spec-expander`
- When you have a clear specification and need code written

**Example prompts:**
- *"Implement the spec at specs/weekly-goals.md."*
- *"Build the progress history export feature per the spec."*

---

### mentor

Analyses a completed chat session to extract lessons learned and produce actionable improvement suggestions for every agent that participated.

**When to use:**
- After completing a feature delivery session
- After fixing a complex bug
- During retrospectives

**Output:** A lessons-learned document in `agent-output/`.

**Example prompts:**
- *"Analyse this session and extract lessons learned."*
- *"What could be improved based on how this feature was delivered?"*

---

### orchestrator

Thin intent router that parses the user's request and delegates to the correct workflow agent (`feature-delivery`, `refactor`, or `release-manager`). Does not contain workflow logic itself.

**When to use:**
- When unsure which agent to invoke
- As the default entry point for any request

**Example prompts:**
- *"I want to add a new goal category feature."*
- *"The progress history modal is slow — fix it."*

---

### quality-gate

Tier 3 specialist that runs the full CI suite (`npm run test`, `npm run lint`, `npm run e2e`) and enforces green gates. Automatically invokes the `implementer` to fix failures, then re-runs the suite — creating a self-healing feedback loop.

**When to use:**
- Before deployment
- After an implementation to verify nothing broke
- When tests are failing and you want automated fixes

**Example prompts:**
- *"Run the full CI suite and fix any failures."*
- *"Ensure all tests pass before we deploy."*

---

### refactor

Restructures code to improve readability, performance, or maintainability without changing external behaviour. Runs the quality gate after changes.

**When to use:**
- When code has become hard to maintain
- After a feature is delivered and cleanup is needed
- When the architect report highlights structural issues

**Example prompts:**
- *"Refactor src/pages/DashboardPage.tsx — it's too large."*
- *"Extract the progress calculation logic into a custom hook."*

---

### release-manager

Tier 2 workflow agent that coordinates production releases: runs a pre-flight quality gate, deploys, and invokes `mentor` to capture lessons learned. Loops back through `implementer` if the quality gate fails.

**When to use:**
- When releasing a new version to production
- For a managed, audited deployment process

**Example prompts:**
- *"Release the current main branch to production."*
- *"Run the release process including tests and deployment."*

---

### scribe

Documentation specialist. Creates and maintains `README.md` files in every project folder, tidies misplaced docs, audits the `plan/` folder for stale content, and verifies docs reflect current code state.

**When to use:**
- After code changes to keep docs in sync
- For a full documentation pass across the repo
- To tidy misplaced markdown files
- To audit and clean up outdated plans

**Workflows:**
1. Document a single folder
2. Document all folders (full repo pass)
3. Update docs from recent changes
4. Tidy existing documentation
5. Audit `plan/` folder for stale content
6. Audit main docs for current state

**Example prompts:**
- *"Document the src/services/ folder."*
- *"Run a full documentation pass across the repo."*
- *"Tidy up docs — there are misplaced files."*
- *"Audit the plan/ folder for completed work."*

---

### spec-expander

Expands a one-liner requirement or idea into a detailed, implementation-ready specification. Output is a Markdown file placed in `specs/` at the repository root.

**When to use:**
- Before starting any feature implementation
- To bridge the gap between a requirement and actionable code changes

**Output:** `specs/<feature-name>.md` containing requirements, data model changes, component changes, test cases, and acceptance criteria.

**Example prompts:**
- *"Expand the 'weekly goal reset' requirement into a spec."*
- *"Write a spec for the progress export feature."*

---

## Shared Resources

| Resource | Purpose |
|---|---|
| [`plan/BUG_TRACKER.md`](plan/BUG_TRACKER.md) | Canonical list of open bugs. Updated by the quality-gate and implementer agents when bugs are found or fixed. |
| [`plan/ROADMAP.md`](plan/ROADMAP.md) | High-level feature roadmap. Consulted by spec-expander and feature-delivery. |
| [`plan/BACKLOG.md`](plan/BACKLOG.md) | Future feature backlog. Source of work items for feature-delivery. |
| `agent-output/` | All agent-generated reports (architect reviews, mentor lessons). Not committed to version control. |
| `specs/` | Specification files generated by spec-expander. Consumed by implementer. |
