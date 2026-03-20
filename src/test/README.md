# test

Global test utilities and [Vitest](https://vitest.dev/) setup shared across all unit and component tests.

| File / Folder | Purpose |
|---|---|
| [`setup.ts`](setup.ts) | Runs before every test file. Imports [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) matchers and mocks browser globals that are unavailable in [jsdom](https://github.com/jsdom/jsdom): `window.matchMedia`, `window.indexedDB`, and `localStorage`. Referenced by `vitest.config.ts` via `setupFiles`. |
| [`test-utils.tsx`](test-utils.tsx) | Re-exports everything from [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/) and provides a `renderWithProviders` wrapper (aliased as `render`) for rendering components inside any future context providers (e.g. auth, theme). |

## Relationships

`setup.ts` is registered globally via `vitest.config.ts`. Import `render` and assertion helpers from `test-utils.tsx` (not directly from `@testing-library/react`) so provider wrapping is applied consistently. Unit tests live in [`../services/__tests__/`](../services/__tests__/README.md).
