# Goal Tracker Web App

A cross-platform Progressive Web App (PWA) for tracking daily, weekly, and monthly goals with offline-first capabilities, Firebase synchronization, and mobile support.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Firebase account (free tier is sufficient for MVP)

### Installation

1. Clone or extract the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Create a web app within the project
   - Copy the config values

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Firebase credentials from step 3.

5. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📦 Available Scripts

### Development
- `npm run dev` — Start Vite dev server with hot module replacement
- `npm run type-check` — Check TypeScript types without building

### Building
- `npm run build` — Build optimized production bundle
- `npm run preview` — Preview production build locally

### Testing
- `npm run test` — Run unit/component tests with Vitest
- `npm run test:ui` — Run tests with interactive UI
- `npm run test:coverage` — Generate coverage report
- `npm run e2e` — Run E2E tests with Playwright
- `npm run e2e:headed` — Run E2E tests with visible browser
- `npm run e2e:debug` — Debug E2E tests step-by-step
- `npm run bdd` — Run BDD feature tests with Cucumber

### Code Quality
- `npm run lint` — Lint code with ESLint

## 📁 Project Structure

```
goal-tracker-web-app/
├── src/
│   ├── config/           # Configuration (Firebase, env, etc.)
│   ├── components/       # React components
│   ├── pages/            # Page-level components
│   ├── services/         # Business logic (Firebase, sync, etc.)
│   ├── store/            # State management (Redux/Context)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Utility functions
│   ├── test/             # Test utilities and setup
│   ├── sw.ts             # Service worker
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── e2e/                  # Playwright E2E tests
├── features/             # Cucumber BDD feature files
│   └── step_definitions/ # Step definitions
├── plans/                # Project documentation
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration with PWA
├── vitest.config.ts      # Vitest configuration
├── playwright.config.ts  # Playwright E2E config
├── cucumber.js           # Cucumber configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## 🔧 Configuration

### Firebase Setup

Firebase credentials should be stored in `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

See [Firebase Setup Guide](./plans/FIREBASE_SETUP.md) for detailed instructions.

## 🧪 Testing

### Unit & Component Tests (Vitest)
```bash
npm run test              # Run all tests
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage report
```

Test files should be in `src/` with `.test.ts` or `.spec.ts` suffix.

### E2E Tests (Playwright)
```bash
npm run e2e              # Run all E2E tests
npm run e2e:headed       # See browser during tests
npm run e2e:debug        # Step through tests
```

Tests cover:
- Desktop browsers (Chrome, Firefox, Safari)
- Mobile browsers (iOS Safari, Chrome)

### BDD Feature Tests (Cucumber)
```bash
npm run bdd              # Run feature files
```

Feature files are in `features/` with `.feature` extension.

## 🌐 Progressive Web App (PWA)

The app is configured as a PWA with offline-first caching, installation capability, and background sync.

## 📱 Mobile Support

Fully responsive and mobile-optimized for iOS and Android.

## 📚 Documentation

- [Project Brief](./plans/PROJECT_BRIEF.md) — Feature requirements and scope
- [Data Model](./plans/DATA_MODEL.md) — Firestore schema and offline storage
- [Firebase Setup](./plans/FIREBASE_SETUP.md) — Firebase configuration guide
- [Development Process](./plans/DEVELOPMENT_PROCESS.md) — Git workflow and development standards
- [Backlog](./plans/BACKLOG.md) — Future features and enhancements
- [Bug Tracker](./plans/BUG_TRACKER.md) — Known issues and bug reports

For comprehensive developer documentation, see the [docs/](./docs/) folder.
- [BDD Features](./features/) — User stories as Gherkin feature files

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📄 License

[To be determined]

---

**Status**: MVP Development Phase  
**Last Updated**: January 4, 2026
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
