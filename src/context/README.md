# context

[React Context](https://react.dev/learn/passing-data-deeply-with-context) providers that supply application-wide state to the component tree.

| File / Folder | Purpose |
|---|---|
| [`AuthContext.tsx`](AuthContext.tsx) | Provides authentication state (`user`, `isLoading`, `error`) and actions (`signup`, `login`, `logout`, `clearError`) to the entire app via `AuthProvider`. Listens to Firebase `onAuthStateChanged` and converts the raw Firebase user object into the application's `User` type. Includes a 10-second timeout to surface misconfigured Firebase credentials gracefully. Export `useAuth()` to consume this context in any component. |

## Relationships

`AuthContext.tsx` depends on [`../config/firebase.ts`](../config/firebase.ts) for the `auth` instance and on [`../types/index.ts`](../types/index.ts) for the `User` type. `AuthProvider` wraps the entire app in [`../App.tsx`](../App.tsx); all page components consume `useAuth()` to access the current user.
