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

### 3. Git Commit
```bash
# View changes
git status
git diff

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Brief summary of changes

Detailed description (optional) of why this change was made."
```

### 4. Before Pushing
- Ensure all tests pass
- Build verification: `npm run build` (0 errors)
- Dev server runs: `npm run dev` (no errors)

## Current Phase

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
