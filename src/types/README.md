# types

Shared [TypeScript](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) interfaces and types for the entire application. All domain data structures are defined here and imported by components, services, and tests.

| File / Folder | Purpose |
|---|---|
| [`index.ts`](index.ts) | Exports all application types: `User`, `UserSettings`, `Goal`, `Progress`, `ProgressMetadata`, `AuditLog`, and related enums/union types. `Goal` includes `status` (`active` \| `archived` \| `completed`) and optional `completedDate`. `Progress` supports retroactive entries via `isRetroactive` and tracks sync state via `ProgressMetadata`. |

## Relationships

Every source file that touches application data imports from this folder (e.g. `import type { Goal } from '@/types'`). The `@/` alias resolves to `src/` and is configured in [`../../vite.config.ts`](../../vite.config.ts) and [`../../tsconfig.app.json`](../../tsconfig.app.json).
