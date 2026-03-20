# pages

Top-level [React](https://react.dev/) page components, one per application route. Each page is responsible for coordinating data loading, state management, and rendering the correct child components.

| File / Folder | Purpose |
|---|---|
| [`AuthPages.css`](AuthPages.css) | Shared styles for the login and signup pages (`.auth-container`, `.auth-card`, `.form-group`, `.error-message`). |
| [`DashboardPage.css`](DashboardPage.css) | Styles for the main dashboard layout, goal grid, completed-goals section header, and responsive breakpoints. |
| [`DashboardPage.tsx`](DashboardPage.tsx) | The authenticated main view. Subscribes to real-time goal updates from Firestore, calculates current-period and yearly progress for each goal, and renders active goals in a grid alongside a collapsible "Completed Goals" section. Manages all modal state (create, edit, log progress, history) and persists the completed-section visibility and individual expand/collapse states to `localStorage`. |
| [`LoginPage.tsx`](LoginPage.tsx) | Email/password login form. Calls `useAuth().login()` and redirects to `/dashboard` on success. Displays Firebase auth errors inline. |
| [`SignupPage.tsx`](SignupPage.tsx) | New-account registration form with client-side validation (password match, minimum length, email format). Calls `useAuth().signup()` and redirects to `/dashboard` on success. |

## Relationships

Pages are registered in [`../App.tsx`](../App.tsx) via [React Router](https://reactrouter.com/). `DashboardPage` is wrapped in a `ProtectedRoute` that redirects unauthenticated users to `/login`. All pages consume [`../context/AuthContext.tsx`](../context/AuthContext.tsx) via `useAuth()`.
