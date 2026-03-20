# src

Application source code for the Goal Tracker [Progressive Web App (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps). Built with [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/).

| File / Folder | Purpose |
|---|---|
| [`App.css`](App.css) | Global CSS applied to the root `App` component (layout resets, base typography). |
| [`App.tsx`](App.tsx) | Root component. Wraps the app in `AuthProvider` and [React Router](https://reactrouter.com/), declares all routes (`/`, `/login`, `/signup`, `/dashboard`), and enforces authentication via a `ProtectedRoute` guard. |
| [`components/`](components/README.md) | Reusable UI components: goal cards, modals for creating/editing goals, progress logging, and progress history. |
| [`config/`](config/README.md) | Firebase SDK initialisation; exports `auth` and `db` service instances. |
| [`context/`](context/README.md) | React Context providers — currently `AuthContext` for authentication state. |
| [`firebase-test.ts`](firebase-test.ts) | Standalone Firebase connectivity diagnostic script. Initialises Firebase independently and logs the result of each connection step to the console. Run manually during development to verify credentials. |
| [`index.css`](index.css) | Base global stylesheet (CSS variables, body defaults, font stack). |
| [`main.tsx`](main.tsx) | Application entry point. Mounts the React app into the `#root` DOM element in [StrictMode](https://react.dev/reference/react/StrictMode). |
| [`pages/`](pages/README.md) | Page-level components: `LoginPage`, `SignupPage`, and `DashboardPage`. |
| [`services/`](services/README.md) | Business-logic layer: Firestore CRUD, IndexedDB offline storage, and progress calculations. |
| [`sw.ts`](sw.ts) | [Service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) built with [Workbox](https://developer.chrome.com/docs/workbox/). Implements offline-first caching strategies: network-first for Firebase API calls, cache-first for images/fonts, stale-while-revalidate for CSS/JS. |
| [`test/`](test/README.md) | Shared test utilities and global setup for [Vitest](https://vitest.dev/) tests. |
| [`types/`](types/README.md) | TypeScript interfaces for all domain objects (`User`, `Goal`, `Progress`, `AuditLog`). |
| [`utils.ts`](utils.ts) | Utility helpers. Currently exports `getTodayString()`, which returns today's date as `YYYY-MM-DD` in the local timezone (required for HTML `<input type="date">` elements). |

## Relationships

The `@/` import alias (configured in [`../vite.config.ts`](../vite.config.ts) and [`../tsconfig.app.json`](../tsconfig.app.json)) resolves to this folder, so any file can import with `import { X } from '@/types'` rather than a relative path.
