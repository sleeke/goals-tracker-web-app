# Goal Tracker Web App

A cross-platform [Progressive Web App (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) for tracking daily, weekly, and monthly goals with offline-first capabilities, [Firebase](https://firebase.google.com/) synchronisation, and mobile support.

Built with [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/), and [Firebase](https://firebase.google.com/). Uses [Workbox](https://developer.chrome.com/docs/workbox/) for service-worker caching and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for offline storage.

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- A [Firebase](https://firebase.google.com/) account (free tier is sufficient)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure Firebase credentials
cp .env.example .env.local
# Edit .env.local with your Firebase project values — see docs/firebase-setup.md

# 3. Start the development server
npm run dev
# App is available at http://localhost:5173
```

See [`docs/getting-started.md`](docs/getting-started.md) for a full Firebase project setup checklist.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start [Vite](https://vite.dev/) dev server with hot module replacement |
| `npm run build` | Compile TypeScript and produce an optimised production bundle in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Type-check TypeScript without emitting files |
| `npm run lint` | Lint with [ESLint](https://eslint.org/) |
| `npm run test` | Run unit/component tests with [Vitest](https://vitest.dev/) |
| `npm run test:ui` | Run tests with the Vitest interactive UI |
| `npm run test:coverage` | Generate a coverage report |
| `npm run e2e` | Run end-to-end tests with [Playwright](https://playwright.dev/) |
| `npm run e2e:headed` | Run E2E tests with a visible browser window |
| `npm run e2e:debug` | Debug E2E tests step-by-step with Playwright Inspector |
| `npm run bdd` | Run BDD scenarios with [Cucumber](https://cucumber.io/) |
| `npm run publish` | Build, run E2E tests, and deploy to Firebase Hosting |

## Project Structure

| File / Folder | Purpose |
|---|---|
| [`src/`](src/README.md) | Application source code (components, pages, services, types, context) |
| [`e2e/`](e2e/README.md) | Playwright end-to-end tests |
| [`features/`](features/README.md) | Cucumber Gherkin BDD feature files and step definitions |
| [`scripts/`](scripts/README.md) | Shell scripts for CI and deployment |
| [`docs/`](docs/README.md) | Developer documentation (architecture, features, configuration, testing, deployment) |
| [`plan/`](plan/README.md) | Planning documents (roadmap, backlog, bug tracker) |
| [`cucumber.js`](cucumber.js) | Cucumber runner configuration |
| [`eslint.config.js`](eslint.config.js) | ESLint flat-config rules |
| [`firebase.json`](firebase.json) | Firebase Hosting and Firestore configuration |
| [`firestore.indexes.json`](firestore.indexes.json) | Firestore composite index definitions |
| [`firestore.rules`](firestore.rules) | Firestore security rules (owner-only access per collection) |
| [`index.html`](index.html) | HTML entry point for the Vite app |
| [`package.json`](package.json) | Dependencies and npm scripts |
| [`playwright.config.ts`](playwright.config.ts) | Playwright E2E configuration (base URL, timeouts, projects) |
| [`tsconfig.json`](tsconfig.json) | Root TypeScript project references |
| [`tsconfig.app.json`](tsconfig.app.json) | TypeScript config for application source (`src/`) |
| [`tsconfig.node.json`](tsconfig.node.json) | TypeScript config for Node.js tooling (Vite config, scripts) |
| [`vite.config.ts`](vite.config.ts) | Vite build config with React plugin, PWA plugin, and `@/` path alias |
| [`vitest.config.ts`](vitest.config.ts) | Vitest unit-test configuration (jsdom environment, setup files) |

## Key Documentation

| Resource | Description |
|---|---|
| [`docs/`](docs/README.md) | Full developer documentation index |
| [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) | System design and data flow |
| [`docs/firebase-setup.md`](docs/firebase-setup.md) | Firebase project and environment variable setup |
| [`docs/getting-started.md`](docs/getting-started.md) | Step-by-step new-developer checklist |
| [`docs/10-TESTING.md`](docs/10-TESTING.md) | Unit, component, E2E, and BDD testing guide |
| [`docs/11-DEPLOYMENT.md`](docs/11-DEPLOYMENT.md) | Build and deploy to Firebase Hosting |
| [`AGENTS.md`](AGENTS.md) | Available AI agents and when to use them |
| [`plan/`](plan/README.md) | Roadmap, backlog, and bug tracker |

## Firebase Configuration

Credentials are read from environment variables prefixed with `VITE_FIREBASE_`. Create a `.env.local` file at the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

See [`docs/firebase-setup.md`](docs/firebase-setup.md) for how to obtain these values from the Firebase Console.
