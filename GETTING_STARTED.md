# Getting Started Checklist

Complete these steps to start development on the Goal Tracker app.

## ⚙️ Initial Setup (Do This First)

- [ ] **1. Create Firebase Project**
  - Go to https://console.firebase.google.com
  - Click "Create a project"
  - Name it "goal-tracker" (or your preference)
  - Enable Google Analytics (optional)
  - Wait for project creation (~5 mins)

- [ ] **2. Create Firebase Web App**
  - In Firebase Console, click "Create app" → Web
  - Choose a name (e.g., "goal-tracker-web")
  - Copy the config object with these fields:
    ```
    apiKey, authDomain, projectId, 
    storageBucket, messagingSenderId, appId, measurementId
    ```

- [ ] **3. Enable Firestore Database**
  - Firebase Console → Build → Firestore Database
  - Click "Create Database"
  - Start in "Production mode"
  - Choose server location closest to you
  - Copy the security rules from `plans/DATA_MODEL.md` → Firestore Console → Rules tab

- [ ] **4. Enable Authentication**
  - Firebase Console → Build → Authentication
  - Click "Get Started"
  - Enable providers:
    - Email/Password ✓
    - Google (recommended)
    - Apple (optional, for later)

- [ ] **5. Configure Environment Variables**
  ```bash
  # In your project root:
  cp .env.example .env.local
  
  # Edit .env.local with your Firebase values from step 2
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
  # ... fill in all values
  ```

- [ ] **6. Start Development Server**
  ```bash
  npm run dev
  ```
  Open http://localhost:5173 in your browser
  You should see the Vite welcome page (app structure not yet built)

## 📋 Development Plan

### Phase 1: Core Infrastructure (This Week)

- [ ] **Create TypeScript Types** (1 hour)
  - File: `src/types/index.ts`
  - Define: Goal, Progress, Period, User interfaces
  - Reference: `plans/DATA_MODEL.md`

- [ ] **Build Firebase Services** (2 hours)
  - File: `src/services/firestore.ts`
  - Implement: CRUD operations for goals and progress
  - Use Firestore and Auth from `src/config/firebase.ts`

- [ ] **Create IndexedDB Service** (1 hour)
  - File: `src/services/indexeddb.ts`
  - Implement: Local caching layer for offline-first
  - Reference: `plans/DATA_MODEL.md` for schema

- [ ] **Build Auth Context** (1 hour)
  - File: `src/context/AuthContext.tsx`
  - Handle: Sign up, login, logout, user state
  - Reference: `features/authentication-sync.feature`

- [ ] **Create Login/Signup Pages** (2 hours)
  - Files: `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`
  - Implement: Email signup with validation
  - Test: Manual testing first

### Phase 2: Core Features (Next Week)

- [ ] **Build Goal Management**
  - `src/pages/GoalsPage.tsx` - List goals
  - `src/components/GoalForm.tsx` - Create/edit
  - Test: `src/components/__tests__/GoalForm.test.tsx`

- [ ] **Build Progress Tracking**
  - `src/components/ProgressLogger.tsx` - Log progress
  - `src/components/ProgressDisplay.tsx` - Show progress
  - Test: E2E test in `e2e/progress.spec.ts`

- [ ] **Build Dashboard**
  - `src/pages/DashboardPage.tsx` - Main view
  - Show current period and yearly progress
  - Reference: `features/progress-tracking.feature`

### Phase 3: Testing & Polish (Week 3+)

- [ ] Write unit tests for all services
- [ ] Write component tests for UI
- [ ] Write E2E tests for critical flows
- [ ] Implement BDD step definitions
- [ ] Test on mobile device

## 🧪 Testing Guidelines

As you develop, write tests alongside code:

```bash
# Run tests in watch mode while developing
npm run test:ui

# This opens an interactive UI to see test results
# As you change code, tests re-run automatically
```

**Testing order of priority:**
1. Service layer (Firebase, IndexedDB) — Most critical for data integrity
2. Components (UI) — Ensure features work correctly
3. E2E tests (User journeys) — Verify complete flows

## 📚 Key References

As you build each feature:

1. **For feature requirements** → `plans/PROJECT_BRIEF.md`
2. **For data structure** → `plans/DATA_MODEL.md`
3. **For user stories** → `features/*.feature` files
4. **For Firebase setup** → `plans/FIREBASE_SETUP.md`
5. **For development workflow** → `plans/DEVELOPMENT_PROCESS.md`
6. **For known bugs** → `plans/BUG_TRACKER.md`

## 🔍 Development Tips

### Before You Start Coding
1. Read the relevant feature file (e.g., `features/goal-management.feature`)
2. Check the data model (e.g., Goal structure in `plans/DATA_MODEL.md`)
3. Sketch the component hierarchy
4. Write tests first (TDD approach)

### During Development
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Tests (optional, for TDD)
npm run test:ui

# Terminal 3: Type checking
npm run type-check
```

### Before Committing
```bash
npm run lint          # Fix any linting errors
npm run type-check    # Ensure types are correct
npm run test          # Run all tests
npm run build         # Ensure production build works
```

## 🎯 First Feature to Build: Goal Creation

This is the simplest feature to start with:

1. **Create types** (`src/types/index.ts`):
   ```typescript
   interface Goal {
     id: string
     title: string
     frequency: 'daily' | 'weekly' | 'monthly'
     targetValue: number
     // ... more fields
   }
   ```

2. **Create form component** (`src/components/GoalForm.tsx`):
   - Text input for title
   - Select for frequency
   - Number input for target
   - Submit button

3. **Create Firebase service** (`src/services/firestore.ts`):
   - `createGoal(goal: Goal)` function

4. **Wire it together** in a page:
   - Import GoalForm and service
   - Call service on form submit
   - Show success message

5. **Write tests**:
   - Unit test for service
   - Component test for form
   - E2E test for complete flow

6. **Reference feature file**:
   - `features/goal-management.feature` → "Create a new daily goal" scenario

## 💡 Common Patterns

### Async Operations
```typescript
// Always use async/await, not .then()
const [loading, setLoading] = useState(false)

async function handleSubmit(data) {
  try {
    setLoading(true)
    await service.create(data)
    // Show success
  } catch (error) {
    // Show error
  } finally {
    setLoading(false)
  }
}
```

### Firebase Queries
```typescript
// Use Firestore queries from src/services/firestore.ts
import { getGoals, createGoal } from '@/services/firestore'

// Don't call Firebase directly from components
// Always go through the service layer
```

## 🚨 Common Gotchas

- **Don't forget `.env.local`** — App won't connect to Firebase without it
- **Firestore security rules** — Copy from `plans/DATA_MODEL.md`
- **Service workers** — Don't affect dev server, only production builds
- **IndexedDB** — Local storage in browser, not backed up automatically
- **Timestamps** — Always use `serverTimestamp()` from Firebase for consistency

## ✅ Verification Checklist

Before moving to the next phase, verify:

- [ ] Firebase project created and configured
- [ ] `.env.local` has all Firebase credentials
- [ ] `npm run dev` works and app loads
- [ ] Types defined for Goal, Progress, User
- [ ] Firebase service layer implemented
- [ ] Authentication working (can sign up/login)
- [ ] Can create a goal and see it in Firestore Console
- [ ] Tests passing for implemented features

## 📞 Stuck? Try This

1. **Type errors?** → Run `npm run type-check` to see specific issues
2. **Build errors?** → Check `npm run build` output
3. **Firebase connection issues?** → Verify `.env.local` credentials
4. **Test failures?** → Check mock setup in `src/test/setup.ts`
5. **Can't find imports?** → Check file paths use `@/` alias correctly

---

**Ready to start?** Pick the first feature and dive in! 🚀

Good luck! Remember: Build small, test often, reference the docs.
