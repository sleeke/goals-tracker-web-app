# Development Process & Git Workflow

## Overview
This document outlines the development process for the Goal Tracker application, including git commit practices to maintain a clean, trackable history.

## Git Commit Guidelines

### Commit After Each Successful Step
After completing a feature, fixing a bug, or adding a component, commit changes to git with a descriptive message.

### Commit Message Format
Use clear, concise messages (1-3 sentences) that describe **what changed and why**:

```
<Type>: <Brief summary in 1-3 sentences>
```

### Commit Types
- **feat**: New feature or component
- **fix**: Bug fix or issue resolution
- **refactor**: Code restructuring without changing functionality
- **test**: Adding or updating tests
- **build**: Build configuration, dependencies, path aliases
- **docs**: Documentation updates
- **style**: Code formatting, CSS styling
- **chore**: Maintenance tasks

### Example Commit Messages
```
feat: Add authentication system with login/signup pages

Implemented Firebase Auth integration with email/password auth, form validation,
error handling, and proper redirect flows between login/signup/dashboard pages.

build: Configure path aliases and wire up React Router

Added @/ import aliases in tsconfig and vite.config, installed react-router-dom,
and set up complete routing with ProtectedRoute component for authenticated views.

feat: Create TypeScript types for goal tracking domain

Defined 15+ interfaces (User, Goal, Progress, Period, etc.) to provide type safety
across the entire application from auth to analytics.
```

## Development Workflow

### 1. Feature Implementation
- Create feature in separate component files
- Run `npm run build` to verify TypeScript compilation
- Test changes locally with `npm run dev`
- Verify in browser at http://localhost:5173/

### 2. Code Quality
- Check for TypeScript errors: `npm run type-check`
- Lint code: `npm run lint`
- Run tests: `npm run test` or `npm run test:ui`
- E2E testing: `npm run e2e` (desktop) or `npm run e2e:headed` (with UI)

### 3. Update Documentation (for significant changes)
For any significant features, refactors, or changes to the architecture:

- **Identify affected docs**: Which documentation files describe the changed feature?
  - Feature docs: `docs/03-AUTHENTICATION.md`, `docs/04-GOALS.md`, etc.
  - Architecture docs: `docs/01-ARCHITECTURE.md`, `docs/02-DATA-TYPES.md`
  - Config docs: `docs/09-CONFIGURATION.md`
  - Other affected docs: See [INDEX.md](INDEX.md)

- **Update documentation**:
  - Update relevant feature documentation with new/changed functionality
  - Update architecture docs if data flow or system design changed
  - Update code examples to match current implementation
  - Add/remove terms in [docs/GLOSSARY.md](./docs/GLOSSARY.md) if needed
  - Add external resources to [docs/LEARNING-RESOURCES.md](./docs/LEARNING-RESOURCES.md) if relevant

- **Verify links**: Ensure all internal documentation links still work

**Example**: If you add a new authentication method, update:
- `docs/03-AUTHENTICATION.md` - Add the new method to the flow
- `docs/01-ARCHITECTURE.md` - If system architecture changed
- `docs/GLOSSARY.md` - If new terms need defining

### 4. Git Commit (including docs)
```bash
# View changes
git status
git diff

# Stage all changes (including documentation updates)
git add .

# Commit with descriptive message
git commit -m "feat: Brief summary of changes

Detailed description of changes made and why.

Documentation updated:
- Updated docs/04-GOALS.md with new goal filtering feature
- Updated docs/08-SERVICES.md with new goalService function
- Updated docs/GLOSSARY.md with new terms"
```

**Commit message format for documentation updates**:
- Add a "Documentation updated:" section listing which docs were changed
- This makes it clear to reviewers what documentation is current
- Example at bottom of section

### 5. Before Pushing
- Ensure all tests pass
- Build verification: `npm run build` (0 errors)
- Dev server runs: `npm run dev` (no errors)
- Documentation is accurate and links work
- Commit message clearly describes what was added/changed

## Documentation Maintenance

### When to Update Docs

Update documentation when making:
- **New features** - Add feature docs or update existing ones
- **API changes** - Update service function signatures in docs/08-SERVICES.md
- **Data model changes** - Update docs/02-DATA-TYPES.md
- **Architecture changes** - Update docs/01-ARCHITECTURE.md
- **Configuration changes** - Update docs/09-CONFIGURATION.md
- **New technical concepts** - Add to docs/GLOSSARY.md

**Do NOT update docs for**:
- Minor bug fixes
- Code style changes
- Internal refactoring (if behavior unchanged)

### How to Update Docs

1. **Identify which docs are affected** (use [INDEX.md](INDEX.md) for reference)
2. **Update each affected document**:
   - Keep examples current with actual code
   - Update descriptions to match implementation
   - Update diagrams/flows if behavior changed
   - Add cross-references to related docs
3. **Test links**: Ensure all internal links still work
4. **Include in commit**: Add "Documentation updated:" section to commit message

### Documentation Structure

```
docs/
├── README.md                 ← Quick navigation
├── INDEX.md                  ← Visual index & reading paths
├── 00-OVERVIEW.md            ← Project overview
├── 01-ARCHITECTURE.md        ← System design
├── 02-DATA-TYPES.md          ← TypeScript types
├── 03-AUTHENTICATION.md      ← Auth feature
├── 04-GOALS.md               ← Goals feature
├── 05-PROGRESS-TRACKING.md   ← Progress feature
├── 06-OFFLINE-FIRST-SYNC.md  ← Offline/sync feature
├── 07-COMPONENTS.md          ← React components
├── 08-SERVICES.md            ← Business logic
├── 09-CONFIGURATION.md       ← Firebase setup
├── 10-TESTING.md             ← Testing guide
├── 11-DEPLOYMENT.md          ← Deploy guide
├── GLOSSARY.md               ← Technical terms
└── LEARNING-RESOURCES.md     ← External links
```

See [INDEX.md](INDEX.md) for which docs cover which topics.

### Example: Documenting a New Feature

If you add a new goal filtering feature:

```bash
# 1. Update the feature docs
# Edit: docs/04-GOALS.md
# Add section on filtering, update code examples, add to "Common Tasks"

# 2. Update services docs if needed
# Edit: docs/08-SERVICES.md
# Add new service function documentation

# 3. Update architecture docs if flow changed
# Edit: docs/01-ARCHITECTURE.md
# Update data flow diagram if relevant

# 4. Update glossary if new terms
# Edit: docs/GLOSSARY.md
# Add definitions for new concepts

# 5. Commit with documentation note
git add .
git commit -m "feat: Add goal filtering by category

Users can now filter goals by category on the dashboard.
Implemented GoalFilter component and updateGoalQuery service function.

Documentation updated:
- docs/04-GOALS.md: Added filtering feature section and code examples
- docs/07-COMPONENTS.md: Added GoalFilter component documentation
- docs/08-SERVICES.md: Added updateGoalQuery function reference"
```



**Phase 3: Visible, Testable Features**

### Completed Steps
1. ✅ TypeScript types for domain models (src/types/index.ts)
2. ✅ Firebase Auth Context with signup/login/logout (src/context/AuthContext.tsx)
3. ✅ Login page with form validation (src/pages/LoginPage.tsx)
4. ✅ Signup page with password confirmation (src/pages/SignupPage.tsx)
5. ✅ Dashboard page with logout functionality (src/pages/DashboardPage.tsx)
6. ✅ Auth UI styling with responsive design (src/pages/AuthPages.css)
7. ✅ Path aliases configuration (@/ imports)
8. ✅ React Router setup with protected routes
9. ✅ App.tsx wired with routing and AuthProvider

### Next Steps
- Build Firebase Services for goal CRUD operations
- Implement IndexedDB for offline storage
- Create goal management UI (create/edit/delete goals)
- Implement progress tracking UI
- Add analytics and statistics views
- Expand testing coverage with unit and E2E tests

## Testing Strategy

### Unit Tests
```bash
npm run test           # Run Vitest
npm run test:ui       # Interactive Vitest UI
npm run test:coverage # Coverage report
```

### E2E Tests
```bash
npm run e2e           # Run Playwright (headless)
npm run e2e:headed    # Run with visible browser
npm run e2e:debug     # Debug mode with inspector
```

### BDD Tests
```bash
npm run bdd           # Run Cucumber/Gherkin feature tests
```

## Performance Considerations

- Service worker caches assets for offline access
- PWA manifest enables app installation
- Build minification and code splitting handled by Vite
- Firebase real-time sync with IndexedDB fallback
- Lazy load route components as needed

## Troubleshooting

### Build fails with path alias errors
- Verify `@/` is configured in both `tsconfig.app.json` and `vite.config.ts`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Type errors on imports
- Use `import type { User }` for TypeScript-only types with `verbatimModuleSyntax: true`
- Check tsconfig.json compiler options

### Dev server not updating
- Press `r + enter` in dev terminal to restart server
- Reload browser with Cmd+Shift+R (hard refresh)
- Check for build errors in terminal

### Firebase connection issues
- Verify .env.local has correct credentials
- Run firebase-test script: `node src/firebase-test.ts`
- Check Firebase Console for API enablement
