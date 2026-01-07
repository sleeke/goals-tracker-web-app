# Architecture Overview

This document describes the overall structure and design of the Goal Tracker application.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE (React)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages: LoginPage, DashboardPage, etc.            │   │
│  │  Components: GoalCard, ProgressLogger, etc.      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │ Uses
                             ▼
┌─────────────────────────────────────────────────────────┐
│              STATE MANAGEMENT & CONTEXT                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AuthContext: User authentication state          │   │
│  │  React Hooks: useState, useEffect, etc.         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │ Uses
                             ▼
┌─────────────────────────────────────────────────────────┐
│           SERVICES (Business Logic)                      │
│  ┌─────────────────┬──────────────────┬──────────────┐  │
│  │ goalService.ts  │ progressService  │ indexedDB.ts │  │
│  └─────────────────┴──────────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │ Uses
                             ▼
┌─────────────────────────────────────────────────────────┐
│          LOCAL STORAGE & CLOUD SYNC                      │
│  ┌──────────────────────┬──────────────────────────┐    │
│  │ IndexedDB (Local)    │  Firebase Firestore      │    │
│  │ - Fast reads         │  - Cloud data            │    │
│  │ - Offline support    │  - Real-time sync        │    │
│  │ - Service Worker     │  - Cross-device sync     │    │
│  └──────────────────────┴──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. **User Action** (e.g., creating a goal)
```
User clicks "Create Goal" 
  → React component updates state (useState)
  → Component calls service function (goalService.createGoal)
```

### 2. **Service Layer**
```
Service function:
  → Saves to local IndexedDB (for offline access)
  → Saves to Firebase Firestore (cloud)
  → Returns result to component
```

### 3. **Synchronization**
```
When offline:
  → Saves only to IndexedDB
  → Queues operation in syncQueue
  
When back online:
  → Service worker detects connection
  → Syncs queued operations to Firestore
  → Resolves conflicts (last-write-wins)
```

### 4. **Real-time Updates**
```
When data changes in Firestore:
  → Firebase listener notifies app
  → Service updates local IndexedDB
  → React component re-renders with new data
```

## Folder Structure

```
src/
├── components/              # React UI components
│   ├── CreateGoalModal.tsx   # Modal for creating goals
│   ├── GoalCard.tsx          # Displays individual goal
│   └── ProgressLoggerModal.tsx # Modal for logging progress
│
├── pages/                   # Page-level components (full screens)
│   ├── DashboardPage.tsx    # Main goals and progress view
│   ├── LoginPage.tsx        # Login form
│   └── SignupPage.tsx       # Signup form
│
├── services/                # Business logic (no UI)
│   ├── goalService.ts       # Goal CRUD operations
│   ├── progressService.ts   # Progress logging and calculations
│   └── indexedDB.ts         # Local database operations
│
├── context/                 # React Context (state management)
│   └── AuthContext.tsx      # Authentication state and methods
│
├── config/                  # Configuration
│   └── firebase.ts          # Firebase initialization
│
├── types/                   # TypeScript interfaces
│   └── index.ts             # All data type definitions
│
├── test/                    # Testing utilities
│   ├── setup.ts             # Test configuration
│   └── test-utils.tsx       # Helper functions for tests
│
├── App.tsx                  # Root component
└── main.tsx                 # Application entry point
```

## Key Design Patterns

### 1. **Separation of Concerns**
- **Components** handle UI only (what user sees)
- **Services** handle business logic (how things work)
- **Context** manages global state (who is logged in)
- **Types** define data structures (what data looks like)

### 2. **Offline-First Architecture**
```
Priority: Local First → Cloud Second
1. Always check IndexedDB first (fast, works offline)
2. Read from Firebase in background
3. When connection is restored, sync local changes
```

### 3. **Real-Time Synchronization**
```
Firebase Listeners: 
  └─ subscribeToUserGoals()
  └─ subscribeToGoalProgress()
  └─ Automatically update UI when data changes
```

### 4. **Context API for Global State**
```
AuthContext provides:
  ├─ user (currently logged-in user)
  ├─ isLoading (is auth checking?)
  ├─ error (any auth errors?)
  ├─ login() method
  ├─ signup() method
  └─ logout() method
```

## Component Hierarchy

```
App
├── AuthContext Provider
│   ├── LoginPage (when not authenticated)
│   ├── SignupPage (when signing up)
│   └── DashboardPage (when authenticated)
│       ├── CreateGoalModal
│       ├── GoalCard (for each goal)
│       │   └── ProgressLogger
│       └── ProgressLoggerModal
```

## State Management Flow

### Example: Logging Progress

```typescript
// 1. User clicks "Log Progress" button
// 2. Component calls: logProgress(goalId, value)
// 3. progressService.ts:
//    - Saves to IndexedDB
//    - Sends to Firebase
// 4. Firebase listener detects change
// 5. subscribeToGoalProgress() callback fires
// 6. Component state updates via setGoalProgress()
// 7. Component re-renders with new data
```

## Authentication & Security

```
┌─────────────────────────────────┐
│   User enters email/password    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Firebase Auth verifies         │
│  Creates session token          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  AuthContext.tsx updates        │
│  Sets user state                │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  DashboardPage shows            │
│  User is now authenticated      │
└─────────────────────────────────┘
```

### Firestore Security Rules
Every database operation is protected by security rules in `firestore.rules`:
- Users can only see their own data
- Users can only create/edit/delete their own records
- Timestamps are immutable (set by server)

## Offline Sync Process

```
OFFLINE MODE:
  Goal is created
  → Saves to IndexedDB
  → Added to syncQueue
  → UI shows immediately (optimistic update)

BACK ONLINE:
  Service worker detects connection
  → Reads syncQueue
  → Sends each queued operation to Firebase
  → Firestore confirms receipt
  → Removes from syncQueue
  → Updates lastSyncTime
```

## TypeScript & Type Safety

Why TypeScript is used:
```typescript
// ✅ With TypeScript - catches errors before running
type Goal = {
  id: string
  title: string
  targetValue: number
}

function createGoal(goal: Goal) { ... }
createGoal({ id: "1", title: "Read", targetValue: 10 })

// ❌ Accidental typo caught by TypeScript:
createGoal({ id: "1", title: "Read", targetValue: "10" }) // Error!
```

## External Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Firestore Guide](https://firebase.google.com/docs/firestore)
- [IndexedDB MDN Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**Related Documentation**:
- [Data Types](./02-DATA-TYPES.md)
- [Services Guide](./08-SERVICES.md)
- [Components Guide](./07-COMPONENTS.md)
