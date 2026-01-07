# Configuration

This document explains how to configure the Goal Tracker app for different environments.

## Environment Variables

**Environment variables** are settings that change between different environments (local development, production, etc.).

### .env.local File

This file stores sensitive information. **Never commit to Git!**

```bash
# Location: PROJECT_ROOT/.env.local

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000
```

### Why VITE_ Prefix?

[Vite](https://vitejs.dev/guide/env-and-mode.html) only exposes variables that start with `VITE_` to the browser. This is for security - prevents accidentally exposing secrets.

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Project Settings" (gear icon)
4. Go to "Your apps" section
5. Click on your web app
6. Copy config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxx...",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project-id",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc...",
  measurementId: "G-XXXXXXXX"
}
```

7. Add to `.env.local`:

```
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxx...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
# ... etc
```

## Firebase Configuration

**File**: [src/config/firebase.ts](../src/config/firebase.ts)

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Read config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Validate required fields
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration incomplete!')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
```

### Key Exports

- `auth`: Firebase Authentication instance
- `db`: Firestore database instance
- `app`: Firebase app instance

### Usage in Services

```typescript
import { auth, db } from '@/config/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

// Use auth:
const user = await createUserWithEmailAndPassword(auth, email, password)

// Use db:
const goals = await getDocs(collection(db, 'goals'))
```

## Build Configuration

### Vite Config

**File**: `vite.config.ts`

Configures the build tool and development server.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Progressive Web App configuration
      manifest: {
        name: 'Goal Tracker',
        short_name: 'Goals',
        description: 'Track your daily goals',
        theme_color: '#ffffff',
      },
      // Service worker settings
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  // Development server settings
  server: {
    port: 5173,
    open: true,
  },
})
```

### TypeScript Config

**File**: `tsconfig.json`

Configures TypeScript compiler.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Key Settings

- `"target": "ES2020"` - JavaScript version to compile to
- `"strict": true` - Strict type checking
- `"paths": {"@/*": ["src/*"]}` - Allows `import from '@/components'` instead of `../../components`

## Firestore Security Rules

**File**: `firestore.rules`

Defines who can read/write database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read their own goals
    match /goals/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Users can only read their own progress entries
    match /progress/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Users can only read their own settings
    match /userSettings/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### Deploy Security Rules

1. Go to Firebase Console
2. Firestore Database → Rules
3. Paste rules above
4. Click "Publish"

### Rule Explanation

```javascript
// Only users who are authenticated can access goals
match /goals/{document=**} {
  // Only if the document's userId matches the logged-in user's uid
  allow read, write: if request.auth.uid == resource.data.userId;
}
```

This means:
- User A can only see goals where `userId == "user_a_uid"`
- User A cannot see User B's goals
- User A cannot modify anyone else's goals

## Service Worker Configuration

**File**: `src/sw.ts`

Background process for offline support and sync.

```typescript
declare const self: ServiceWorkerGlobalScope

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Listen for background sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Sync logic here
  console.log('Syncing data...')
}
```

## Testing Configuration

### Vitest Config

**File**: `vitest.config.ts`

Unit test runner configuration.

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### Playwright Config

**File**: `playwright.config.ts`

End-to-end test configuration.

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
```

### Test Setup

**File**: `src/test/setup.ts`

Global test setup and configuration.

```typescript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

## ESLint Configuration

**File**: `eslint.config.js`

Code quality and style rules.

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import typescript from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
```

### Run ESLint

```bash
# Check for issues
npm run lint

# (Usually) automatically fix issues
npx eslint --fix src/
```

## Environment-Specific Configuration

### Development

```bash
VITE_APP_ENV=development
VITE_FIREBASE_API_KEY=dev_key_...
```

- Hot reloading enabled
- Debug logging enabled
- Longer timeouts for manual testing

### Production

```bash
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=prod_key_...
```

- Minified bundle
- Debug logging disabled
- Optimized performance

### Example: Conditional Behavior

```typescript
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'

if (isDevelopment) {
  console.log('[DEBUG]', message)
}
```

## Common Configuration Tasks

### Change App Name

1. Edit `vite.config.ts`:
```typescript
manifest: {
  name: 'New App Name',
  short_name: 'NewName',
}
```

2. Edit `index.html`:
```html
<title>New App Name</title>
```

### Change Port (Local Development)

Edit `vite.config.ts`:
```typescript
server: {
  port: 3000,  // Changed from 5173
}
```

### Add Environment Variable

1. Add to `.env.local`:
```
VITE_NEW_VAR=value
```

2. Use in code:
```typescript
const value = import.meta.env.VITE_NEW_VAR
```

3. TypeScript: Add to `vite-env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly VITE_NEW_VAR: string
}
```

## Troubleshooting

### "Firebase configuration incomplete" warning

1. Check `.env.local` exists in project root
2. Verify all VITE_FIREBASE_* variables are set
3. Restart dev server: Ctrl+C, then `npm run dev`

### Port 5173 already in use

Change in `vite.config.ts`:
```typescript
server: {
  port: 5174,  // Use different port
}
```

### ESLint errors not showing

1. Install ESLint extension in VS Code
2. Restart VS Code
3. Check `eslint.config.js` is correct

### TypeScript errors but code compiles

1. Run `npm run type-check`
2. Fix any reported errors
3. Some errors are warnings only

## External Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig.json.html)
- [ESLint Configuration](https://eslint.org/docs/rules/)
- [Vitest Documentation](https://vitest.dev/)

---

**Related Documentation**:
- [Deployment](./11-DEPLOYMENT.md)
- [Architecture Overview](./01-ARCHITECTURE.md)
- [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)
