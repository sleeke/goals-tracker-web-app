# Services Guide

This document explains the business logic layer that handles data operations.

## What are Services?

**Services** are functions that handle business logic (how things work) separate from UI (what things look like).

```
Without Services (mixing concerns):
Component: "Create a goal"
  ├─ Validate input
  ├─ Save to IndexedDB
  ├─ Save to Firebase
  ├─ Handle errors
  ├─ Update UI state
  └─ Show error messages

This makes components complex and hard to test! ❌

With Services (separation of concerns):
Component: "Create a goal"
  └─ Call: createGoal(data)
       └─ Service handles everything: validation, saving, sync, errors
Service: createGoal(data)
  ├─ Validate input
  ├─ Save to IndexedDB
  ├─ Save to Firebase
  ├─ Handle errors
  └─ Return result

Components stay simple! ✅
```

## Service Architecture

```
src/services/
├── goalService.ts           # Goal CRUD operations
├── progressService.ts       # Progress logging and calculations
├── indexedDB.ts             # Local database operations
└── __tests__/               # Test files
    ├── goalService.test.ts
    └── progressService.test.ts
```

## Goal Service

**File**: [src/services/goalService.ts](../src/services/goalService.ts)

Handles all goal-related operations.

### Functions

#### getUserGoals()

Get all goals for a user.

```typescript
export async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal))
  } catch (error) {
    console.error('Error fetching user goals:', error)
    throw error
  }
}
```

**Usage**:
```typescript
// Get all goals once
const goals = await getUserGoals(userId)

// Or use the streaming version (real-time)
const unsubscribe = subscribeToUserGoals(userId, (goals) => {
  setGoals(goals)
})
```

**Returns**: Promise<Goal[]> - Array of goals

---

#### subscribeToUserGoals()

Real-time listener for goal changes.

```typescript
export function subscribeToUserGoals(
  userId: string,
  callback: (goals: Goal[]) => void
): () => void {
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Goal))
    callback(goals)  // Call function with goals
  })

  return unsubscribe  // Function to stop listening
}
```

**Key Concept**: **Real-time listener** - Firebase calls your callback whenever goals change.

```typescript
// Start listening
const unsubscribe = subscribeToUserGoals(userId, (goals) => {
  console.log('Goals changed:', goals)
})

// Stop listening
unsubscribe()
```

**Returns**: Function to unsubscribe from listener

---

#### createGoal()

Create a new goal.

```typescript
export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goalData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return {
      ...goalData,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Goal
  } catch (error) {
    console.error('Error creating goal:', error)
    throw error
  }
}
```

**Parameter Notes**:
- `userId`: The user who owns this goal
- `goalData`: Goal info without id or timestamps (those are auto-generated)
- `Omit<Goal, ...>`: TypeScript type that means "Goal without these fields"

**Usage**:
```typescript
const newGoal = await createGoal(userId, {
  title: 'Read 30 pages',
  targetValue: 30,
  unit: 'pages',
  frequency: 'daily',
  category: 'Learning',
  priority: 'high',
  color: '#3498DB',
  status: 'active',
})
```

**Returns**: Promise<Goal> - The created goal with generated id and timestamps

---

#### updateGoal()

Edit an existing goal.

```typescript
export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goalId)
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}
```

**Parameter Notes**:
- Only include fields you want to change
- `updatedAt` is automatically set to current time

**Usage**:
```typescript
// Update title only
await updateGoal(goalId, { title: 'Read 50 pages' })

// Update multiple fields
await updateGoal(goalId, {
  title: 'Read 50 pages',
  targetValue: 50,
  status: 'archived',
})

// Update status to completed
await updateGoal(goalId, {
  status: 'completed',
  completedDate: new Date(),
})
```

**Returns**: Promise<void> - No return value

---

#### deleteGoal()

Delete a goal permanently.

```typescript
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goalId)
    await deleteDoc(goalRef)
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}
```

**Warning**: This is permanent. Consider archiving instead of deleting.

**Usage**:
```typescript
// Archive goal (safer than delete)
await updateGoal(goalId, { status: 'archived' })

// Actually delete
await deleteGoal(goalId)
```

**Returns**: Promise<void> - No return value

---

## Progress Service

**File**: [src/services/progressService.ts](../src/services/progressService.ts)

Handles progress logging and calculations.

### Functions

#### logProgress()

Record progress toward a goal.

```typescript
export async function logProgress(
  goalId: string,
  userId: string,
  value: number,
  note?: string,
  timestamp?: Date,
  isRetroactive?: boolean
): Promise<Progress> {
  try {
    const progressRef = await addDoc(collection(db, 'progress'), {
      goalId,
      userId,
      value,
      note: note || '',
      loggedAt: timestamp ? Timestamp.fromDate(timestamp) : Timestamp.now(),
      timestamp: timestamp ? Timestamp.fromDate(timestamp) : Timestamp.now(),
      isRetroactive: isRetroactive || false,
      metadata: {
        deviceId: generateDeviceId(),
        syncStatus: 'pending',
      },
    })

    return {
      id: progressRef.id,
      goalId,
      value,
      note: note || '',
      loggedAt: timestamp || new Date(),
      timestamp: timestamp || new Date(),
      isRetroactive: isRetroactive || false,
    } as unknown as Progress
  } catch (error) {
    console.error('Error logging progress:', error)
    throw error
  }
}
```

**Parameter Notes**:
- `value`: How much progress (e.g., 25 pages)
- `note`: Optional reason or details
- `timestamp`: For retroactive logging (defaults to now)
- `isRetroactive`: Mark as log-for-past-date

**Usage**:
```typescript
// Log progress today
await logProgress(goalId, userId, 30, 'Finished chapter 3')

// Log progress for yesterday
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
await logProgress(goalId, userId, 30, 'Missed yesterday', yesterday, true)
```

**Returns**: Promise<Progress> - The created progress entry

---

#### getGoalProgress()

Get all progress entries for a goal.

```typescript
export async function getGoalProgress(
  goalId: string,
  limit?: number
): Promise<Progress[]> {
  try {
    const q = query(
      collection(db, 'progress'),
      where('goalId', '==', goalId),
      orderBy('loggedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    const records = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Progress))

    return limit ? records.slice(0, limit) : records
  } catch (error) {
    console.error('Error fetching goal progress:', error)
    throw error
  }
}
```

**Usage**:
```typescript
// Get all progress entries
const allProgress = await getGoalProgress(goalId)

// Get last 10 entries
const recentProgress = await getGoalProgress(goalId, 10)
```

**Returns**: Promise<Progress[]> - Array of progress entries

---

#### calculateGoalProgress()

Sum progress within a date range.

```typescript
export async function calculateGoalProgress(
  goalId: string,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const constraints = [
      where('goalId', '==', goalId),
      where('userId', '==', userId),
      where('loggedAt', '>=', Timestamp.fromDate(startDate)),
      where('loggedAt', '<=', Timestamp.fromDate(endDate)),
    ]
    
    const q = query(collection(db, 'progress'), ...constraints)
    const snapshot = await getDocs(q)
    
    let total = 0
    snapshot.forEach((doc) => {
      const progress = doc.data() as Progress
      if (!progress.revertedBy) {  // Don't count reverted entries
        total += progress.value
      }
    })
    
    return total
  } catch (error) {
    console.error('Error calculating progress:', error)
    throw error
  }
}
```

**Usage**:
```typescript
// Today's progress
const today = new Date()
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

const todayProgress = await calculateGoalProgress(goalId, userId, startOfDay, endOfDay)

// This week's progress
const dayOfWeek = today.getDay()
const weekStart = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
const weekEnd = new Date(today.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000)

const weekProgress = await calculateGoalProgress(goalId, userId, weekStart, weekEnd)

// This year's progress
const yearStart = new Date(today.getFullYear(), 0, 1)
const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59)

const yearProgress = await calculateGoalProgress(goalId, userId, yearStart, yearEnd)
```

**Returns**: Promise<number> - Total progress value

---

#### subscribeToGoalProgress()

Real-time listener for progress changes.

```typescript
export function subscribeToGoalProgress(
  goalId: string,
  callback: (progress: Progress[]) => void
): () => void {
  const q = query(
    collection(db, 'progress'),
    where('goalId', '==', goalId),
    orderBy('loggedAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const progress = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      loggedAt: doc.data().loggedAt.toDate(),  // Convert timestamp
    } as Progress))
    
    callback(progress)
  })

  return unsubscribe
}
```

**Usage**:
```typescript
const unsubscribe = subscribeToGoalProgress(goalId, (progress) => {
  console.log('Progress updated:', progress)
  setProgress(progress)
})

// Stop listening
unsubscribe()
```

**Returns**: Function to unsubscribe

---

#### revertProgress()

Undo a progress entry.

```typescript
export async function revertProgress(progressId: string): Promise<void> {
  try {
    const progressRef = doc(db, 'progress', progressId)
    
    await updateDoc(progressRef, {
      revertedBy: getCurrentUserUid(),
      revertedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error reverting progress:', error)
    throw error
  }
}
```

**Why Revert Instead of Delete?**

```
Audit trail is important:
- Keeps history of changes
- Shows what was logged and when
- Shows what was reverted and by whom
- Helps with accountability
```

**Usage**:
```typescript
await revertProgress(progressId)

// Progress is still there, but marked as reverted
// It won't be counted in calculations
```

**Returns**: Promise<void> - No return value

---

## IndexedDB Service

**File**: [src/services/indexedDB.ts](../src/services/indexedDB.ts)

Manages local browser database.

### Key Functions

```typescript
// Initialize local database
const db = await initDB()

// Save locally (for offline access)
await saveGoalLocally(goal)
await saveProgressLocally(progress)

// Read locally
const goals = await getGoalsLocally(userId)
const progress = await getProgressLocally(goalId)

// Delete locally
await deleteGoalLocally(goalId)

// Sync queue management
await addToSyncQueue(operation)
const queue = await getSyncQueue()
await removeSyncQueueItem(id)
```

See [Offline-First & Sync documentation](./06-OFFLINE-FIRST-SYNC.md) for detailed usage.

---

## Service Patterns

### Error Handling

All services follow this pattern:

```typescript
export async function someOperation() {
  try {
    // Do the operation
    const result = await firebaseOperation()
    
    // Return result
    return result
  } catch (error) {
    // Log for debugging
    console.error('Error doing operation:', error)
    
    // Re-throw so caller can handle it
    throw error
  }
}
```

**Usage in Component**:
```typescript
try {
  await someOperation()
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error')
}
```

### Async/Await

All services use async/await for cleaner code:

```typescript
// Bad (callback hell):
doThing1((result1) => {
  doThing2(result1, (result2) => {
    doThing3(result2, (result3) => {
      console.log(result3)
    })
  })
})

// Good (async/await):
const result1 = await doThing1()
const result2 = await doThing2(result1)
const result3 = await doThing3(result2)
console.log(result3)
```

### Firestore Query Constraints

Building queries dynamically:

```typescript
const constraints: QueryConstraint[] = []

if (userId) {
  constraints.push(where('userId', '==', userId))
}

if (startDate) {
  constraints.push(where('loggedAt', '>=', Timestamp.fromDate(startDate)))
}

if (status) {
  constraints.push(where('status', '==', status))
}

const q = query(collection(db, 'goals'), ...constraints)
const results = await getDocs(q)
```

## Common Tasks

### Add a New Service Function

1. Add to appropriate file (goalService, progressService, etc.)
2. Include error handling
3. Add TypeScript types
4. Export the function
5. Add JSDoc comments

Example:

```typescript
/**
 * Archive all inactive goals for a user
 * @param userId - User ID
 * @returns Number of goals archived
 */
export async function archiveInactiveGoals(userId: string): Promise<number> {
  try {
    const goals = await getUserGoals(userId)
    const inactiveGoals = goals.filter(g => g.status === 'active' && shouldArchive(g))
    
    let count = 0
    for (const goal of inactiveGoals) {
      await updateGoal(goal.id, { status: 'archived' })
      count++
    }
    
    return count
  } catch (error) {
    console.error('Error archiving goals:', error)
    throw error
  }
}
```

### Test a Service Function

```typescript
import { describe, it, expect } from 'vitest'
import { createGoal, getUserGoals } from './goalService'

describe('goalService', () => {
  it('creates a goal', async () => {
    const goal = await createGoal('user123', {
      title: 'Test Goal',
      targetValue: 10,
      unit: 'items',
      frequency: 'daily',
      // ... other required fields
    })

    expect(goal.id).toBeDefined()
    expect(goal.title).toBe('Test Goal')
  })
})
```

## Debugging Services

### Enable Logging

Add debug logs in services:

```typescript
export async function createGoal(userId: string, goalData) {
  console.log('[goalService] Creating goal:', { userId, goalData })
  
  try {
    const goal = await addDoc(collection(db, 'goals'), { ... })
    console.log('[goalService] Goal created:', goal.id)
    return goal
  } catch (error) {
    console.error('[goalService] Error creating goal:', error)
    throw error
  }
}
```

### Test in Console

```javascript
// In browser console:
import { createGoal } from './src/services/goalService'

const goal = await createGoal('userId', {
  title: 'Test',
  targetValue: 10,
  // ... other fields
})
console.log(goal)
```

## External Resources

- [Firestore API Reference](https://firebase.google.com/docs/firestore)
- [Async/Await Guide](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- [TypeScript Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)

---

**Related Documentation**:
- [Components Guide](./07-COMPONENTS.md)
- [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)
- [Architecture Overview](./01-ARCHITECTURE.md)
