# config

[Firebase](https://firebase.google.com/docs/web/setup) SDK initialisation for the application. Reads credentials from environment variables and exports ready-to-use service instances.

| File / Folder | Purpose |
|---|---|
| [`firebase.ts`](firebase.ts) | Initialises the Firebase app from `VITE_FIREBASE_*` environment variables, then creates and exports `auth` ([Firebase Authentication](https://firebase.google.com/docs/auth)) and `db` ([Cloud Firestore](https://firebase.google.com/docs/firestore)) service instances. Logs a console error if required variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`) are missing. |

## Relationships

`auth` and `db` are imported by [`../context/AuthContext.tsx`](../context/AuthContext.tsx) and all files in [`../services/`](../services/README.md). Environment variables must be defined in a `.env.local` file at the project root — see [`../../docs/firebase-setup.md`](../../docs/firebase-setup.md) for setup instructions.

## Usage

Copy `.env.example` to `.env.local` and fill in your Firebase project credentials before starting the dev server:

```bash
cp .env.example .env.local
npm run dev
```
