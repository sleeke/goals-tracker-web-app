# Offline-First & Synchronization

This document explains how the app works offline and syncs data with the cloud.

## The Problem This Solves

Traditional apps require internet connection:

```
No Internet Connection:
  User tries to create goal
       ↓
  App says "Cannot connect to server"
       ↓
  User frustrated ❌
```

This app works offline:

```
No Internet Connection:
  User creates goal
       ↓
  Goal saved to device immediately ✅
       ↓
  User sees it in the app
       ↓
  Internet returns
       ↓
  Goal syncs to cloud automatically ✅
```

## Offline-First Architecture

**Offline-First** means: prioritize local device storage, sync with cloud when possible.

```
┌──────────────────────────────────────┐
│     Browser (Laptop/Phone)            │
│  ┌─────────────────────────────────┐  │
│  │ React Component (UI)             │  │
│  └────────────┬────────────────────┘  │
│               │                        │
│  ┌────────────▼────────────────────┐  │
│  │ Service Functions (Business)    │  │
│  └────────────┬────────────────────┘  │
│               │                        │
│  ┌────────────▼────────────────────┐  │
│  │ IndexedDB (Local Database)      │  │ ← FASTEST & OFFLINE
│  └────────────┬────────────────────┘  │
│               │                        │
│  ┌────────────▼────────────────────┐  │
│  │ Service Worker                  │  │ ← BACKGROUND SYNC
│  └────────────┬────────────────────┘  │
│               │                        │
└───────────────┼───────────────────────┘
                │
        (When Internet Available)
                │
                ▼
    ┌───────────────────────┐
    │  Firebase Cloud       │
    │  - Firestore         │
    │  - Authentication     │
    └───────────────────────┘
```

## Two Types of Storage

### 1. IndexedDB (Local)

A database stored on the device, in the browser.

```typescript
// IndexedDB is stored here:
// - Desktop: ~/.cache or ~/AppData (depending on browser)
// - Mobile: App's private storage

// Advantages:
✓ Faster than network
✓ Works offline
✓ No internet needed
✓ Persistent between sessions

// Disadvantages:
✗ Only on this device
✗ Limited size (~50MB typical)
✗ No sync by default
```

### 2. Firebase Firestore (Cloud)

Database in the cloud, accessible from any device.

```typescript
// Firestore is stored:
// - In Google's data centers
// - Accessible from anywhere

// Advantages:
✓ Accessible from any device
✓ Unlimited size
✓ Automatic backups
✓ Real-time updates

// Disadvantages:
✗ Requires internet
✗ Slower than local storage
```

## The Sync Flow

### Creating a Goal When Online

```
User: "Create goal"
  │
  ├─→ Service: Save to IndexedDB (fast, local)
  │
  ├─→ Service: Save to Firestore (cloud)
  │
  └─→ Firebase returns confirmation
```

### Creating a Goal When Offline

```
User: "Create goal"
  │
  ├─→ Service: Save to IndexedDB ✅
  │
  ├─→ Service: Try to save to Firestore
  │    └─ FAILS - no internet
  │
  ├─→ Service: Add to SyncQueue (queue of unsent operations)
  │
  └─→ UI updates immediately (optimistic update)

Later when internet returns:
  │
  ├─→ Service worker detects connection
  │
  ├─→ Reads SyncQueue
  │
  ├─→ Sends queued operations to Firestore
  │
  └─→ Removes from SyncQueue when confirmed
```

## Key Files

### [src/services/indexedDB.ts](../src/services/indexedDB.ts)

Manages local database (IndexedDB).

**Key Functions**:

| Function | Purpose |
|----------|---------|
| `initDB()` | Create/open local database |
| `saveGoalLocally(goal)` | Save goal to local storage |
| `getGoalsLocally(userId)` | Get goals from local storage |
| `deleteGoalLocally(goalId)` | Delete goal from local storage |
| `saveProgressLocally(progress)` | Save progress entry locally |
| `getProgressLocally(goalId)` | Get progress from local storage |
| `addToSyncQueue(operation)` | Queue operation for later sync |
| `getSyncQueue()` | Get all queued operations |

### [src/sw.ts](../src/sw.ts)

Service Worker that runs in background and handles sync.

### Service Functions

Each service (goalService, progressService) handles sync:

```typescript
// Example from goalService
export async function createGoal(userId: string, goalData) {
  // Step 1: Save locally (always succeeds)
  await saveGoalLocally(newGoal)
  
  // Step 2: Try to save to cloud (might fail)
  try {
    await saveGoalToFirestore(newGoal)
  } catch (error) {
    // Step 3: If fails, queue for later
    await addToSyncQueue({
      type: 'CREATE_GOAL',
      data: newGoal
    })
  }
  
  return newGoal
}
```

## Detailed Sync Process

### Step 1: User Performs Action

```typescript
// User clicks "Create Goal"
const goal = {
  id: generateId(),
  title: "Read 30 pages",
  targetValue: 30,
  // ... other fields
}
```

### Step 2: Save Locally First

```typescript
// ALWAYS succeeds (no network needed)
await saveGoalLocally(goal)

// Goal now visible in UI immediately
setGoals([...goals, goal])  // Component updates
```

### Step 3: Try Cloud Save

```typescript
try {
  // Try to sync to Firebase
  await addDoc(collection(db, 'goals'), goal)
  
  // If successful, update metadata
  await updateGoalLocally(goal.id, { syncStatus: 'synced' })
} catch (error) {
  // If fails, queue for later
  await addToSyncQueue({
    operation: 'CREATE',
    collection: 'goals',
    data: goal
  })
  
  // Update metadata
  await updateGoalLocally(goal.id, { syncStatus: 'pending' })
}
```

### Step 4: Service Worker Monitors Connection

```typescript
// In service worker (sw.ts)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-goals') {
    event.waitUntil(syncGoals())
  }
})

async function syncGoals() {
  // Get all pending operations
  const queue = await getSyncQueue()
  
  for (const operation of queue) {
    try {
      // Send to Firebase
      if (operation.type === 'CREATE_GOAL') {
        await addDoc(collection(db, 'goals'), operation.data)
      }
      // ... handle other operations
      
      // Remove from queue
      await removeSyncQueueItem(operation.id)
    } catch (error) {
      console.error('Sync failed:', error)
      // Will retry on next sync event
    }
  }
}
```

## Conflict Resolution

### The Problem: Two Devices Editing Same Goal

```
Device A (Offline)          Device B (Online)
─────────────────          ─────────────────

1:00 PM: Create goal       (offline mode)
         "Read Daily"
         
1:05 PM: Can't sync yet    1:10 PM: Cloud: Create goal
                                    "Read 30 Pages"
                                    
                           1:20 PM: Edit goal:
                                    targetValue: 30 → 45

2:00 PM: Internet returns
         Tries to sync local "Read Daily"
         
Which version wins?
```

### Last-Write-Wins Strategy

The app uses **timestamp-based conflict resolution**:

```typescript
interface Goal {
  title: string
  targetValue: number
  updatedAt: Date  // Most important for sync!
}

// Sync logic
const localGoal = { targetValue: 30, updatedAt: 1:05 }
const cloudGoal = { targetValue: 45, updatedAt: 1:20 }

if (cloudGoal.updatedAt > localGoal.updatedAt) {
  // Cloud version is newer, keep it
  await updateGoalLocally(cloudGoal)
} else {
  // Local version is newer, send to cloud
  await sendToFirestore(localGoal)
}
```

### Why Last-Write-Wins?

```
✓ Simple: No complex merge logic
✓ Predictable: Everyone knows the rules
✓ Fair: Most recent change always wins
✓ Consistent: Works across all devices
```

## Real-Time Sync with Firebase Listeners

While online, Firebase listeners keep data current:

```typescript
// In goalService.ts
export function subscribeToUserGoals(userId: string, callback) {
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId)
  )

  // Listen for changes on server
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const goals = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))
    
    // Update local IndexedDB
    for (const goal of goals) {
      await saveGoalLocally(goal)
    }
    
    // Update component
    callback(goals)
  })

  return unsubscribe
}
```

### How It Works

```
You (Device A)          Someone Else (Device B)     Firebase Cloud
──────────────          ────────────────────────     ──────────────

Listening...
  │
  ├─ Real-time listener active on goals
  │
  │                      Edit goal title
  │                        │
  │                        ├─→ Saves to Firebase
  │                        │
  ├─ Firebase notifies all listeners
  │  that goals changed
  │
  ├─→ Update IndexedDB locally
  │
  ├─→ Component re-renders
  │
  └─→ You see change immediately! ✅
```

## SyncQueue & Background Sync

For operations that fail due to connection:

```typescript
// IndexedDB SyncQueue Structure
{
  id: 1,
  operation: 'CREATE_GOAL',
  collection: 'goals',
  data: { ... },
  timestamp: 1705353600000,
  retries: 0
}
```

### Retry Logic

```typescript
const MAX_RETRIES = 3
const RETRY_DELAY = 5000  // 5 seconds

async function processQueue() {
  const queue = await getSyncQueue()
  
  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) {
      console.warn('Max retries exceeded:', item)
      continue  // Skip this item
    }
    
    try {
      await executeSyncOperation(item)
      await removeSyncQueueItem(item.id)
    } catch (error) {
      // Increment retry counter
      await updateSyncQueueItem(item.id, {
        retries: item.retries + 1
      })
      
      // Will try again next sync
    }
  }
}
```

## Common Tasks

### Check if Something is Synced

```typescript
const isSynced = goal.metadata?.syncStatus === 'synced'

if (isSynced) {
  console.log('Goal is saved to cloud')
} else {
  console.log('Goal is pending sync')
}
```

### Force Sync Immediately

```typescript
// Trigger service worker sync
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  const registration = await navigator.serviceWorker.ready
  await registration.sync.register('sync-all')
}
```

### Get Pending Operations

```typescript
const pendingOps = await getSyncQueue()
const pendingGoals = pendingOps.filter(op => op.collection === 'goals')

console.log(`${pendingGoals.length} goals pending sync`)
```

### Clear Cache

```typescript
// Delete local database
const db = await initDB()
db.delete()

// Clear Service Worker cache
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.ready
  await registration.unregister()
  
  const caches = await caches.keys()
  await Promise.all(caches.map(cache => caches.delete(cache)))
}
```

## Monitoring Sync Status

### Add UI Indicator

```typescript
export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState('synced')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const checkSync = async () => {
      const queue = await getSyncQueue()
      setPendingCount(queue.length)
      setSyncStatus(queue.length > 0 ? 'pending' : 'synced')
    }

    const interval = setInterval(checkSync, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`sync-status ${syncStatus}`}>
      {syncStatus === 'synced' ? '✅ Synced' : `⏳ ${pendingCount} pending`}
    </div>
  )
}
```

## Troubleshooting

### Data not syncing to cloud

1. Check internet connection
2. Look at SyncQueue - are items queued?
3. Check Firestore rules allow writes
4. Check browser console for errors
5. Try refreshing page (triggers sync)

### Different data on different devices

1. Check lastSyncTime on both devices
2. Try clearing cache and refreshing
3. Check for clock skew (device time wrong)
4. Look for merge conflicts

### Service Worker not syncing

1. Check SW is registered: `chrome://serviceworker-internals/` (Chrome)
2. Check SW has permission to access indexedDB
3. Look at SW console for errors
4. Try unregistering and re-registering

## External Resources

- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Firebase Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

---

**Related Documentation**:
- [Configuration](./09-CONFIGURATION.md)
- [Architecture Overview](./01-ARCHITECTURE.md)
- [Glossary](./GLOSSARY.md) - Look up: "Sync", "IndexedDB", "Service Worker"
