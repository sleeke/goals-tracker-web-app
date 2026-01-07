# Progress Tracking

This document explains how users log progress toward goals and how the app displays their progress.

## What is Progress?

**Progress** is a record of how much work a user has completed toward a goal. For example:

```
Goal: "Read 30 pages daily"

Progress entries:
- Jan 15, 8:30 AM: Logged 25 pages
- Jan 15, 8:45 AM: Logged 5 more pages
- Total today: 30 pages ✅ Goal met!
```

## Progress Data Structure

Each progress entry contains:

```typescript
interface Progress {
  id: string              // Unique ID
  goalId: string          // Which goal?
  userId: string          // Who owns this?
  value: number           // How much progress? (25)
  note?: string           // Why? ("Finished chapter 3")
  loggedAt: Date          // When was it logged?
  isRetroactive: boolean  // Is it for a past date?
  revertedBy?: string     // Was it reverted?
}
```

## Logging Progress: User Flow

### Step 1: User Clicks "Log Progress"

In a GoalCard component:

```typescript
<button onClick={() => handleLogProgress(goal.id)}>
  Log Progress
</button>
```

### Step 2: Open Progress Logger Modal

```typescript
const [showProgressLogger, setShowProgressLogger] = useState(false)
const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

const handleLogProgress = (goalId: string) => {
  setSelectedGoal(goals.find(g => g.id === goalId))
  setShowProgressLogger(true)
}
```

### Step 3: User Enters Progress

ProgressLoggerModal component shows a form:

```typescript
<form onSubmit={handleSubmit}>
  <label>
    How much progress?
    <input 
      type="number" 
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
    />
    <span>{selectedGoal.unit}</span>
  </label>
  
  <label>
    Notes (optional)
    <textarea 
      value={note}
      onChange={(e) => setNote(e.target.value)}
    />
  </label>
  
  <button type="submit">Log Progress</button>
</form>
```

### Step 4: Call Progress Service

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  
  try {
    // Call logProgress() service function
    await logProgress(
      selectedGoal.id,
      user.uid,
      value,
      note
    )
    
    // Close modal and reset form
    setShowProgressLogger(false)
    setValue(0)
    setNote('')
  } catch (error) {
    setError(error.message)
  }
}
```

### Step 5: Save to Cloud

The `logProgress()` service function:

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
    // Add to Firebase
    const progressRef = await addDoc(collection(db, 'progress'), {
      goalId,
      userId,
      value,
      note: note || '',
      loggedAt: timestamp ? Timestamp.fromDate(timestamp) : Timestamp.now(),
      isRetroactive: isRetroactive || false,
      metadata: {
        deviceId: generateDeviceId(),
        syncStatus: 'pending',
      },
    })

    // Return new progress entry
    return {
      id: progressRef.id,
      goalId,
      userId,
      value,
      note: note || '',
      loggedAt: timestamp || new Date(),
      isRetroactive: isRetroactive || false,
    } as Progress
  } catch (error) {
    console.error('Error logging progress:', error)
    throw error
  }
}
```

### Step 6: Update UI in Real-Time

The DashboardPage subscribes to progress changes:

```typescript
useEffect(() => {
  if (!goals.length || !user?.uid) return

  const unsubscribers: Array<() => void> = []

  for (const goal of goals) {
    // Listen for progress changes
    const unsubscribe = subscribeToGoalProgress(goal.id, (progress) => {
      // Calculate total progress for today
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      // Sum all progress entries for today (excluding reverted ones)
      const totalProgress = progress
        .filter((p) => p.loggedAt >= startOfDay && p.loggedAt <= endOfDay && !p.revertedBy)
        .reduce((total, p) => total + (p.value || 0), 0)

      // Update state - component re-renders
      setGoalProgress((prev) => ({
        ...prev,
        [goal.id]: totalProgress,
      }))
    })
    
    unsubscribers.push(unsubscribe)
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub())
  }
}, [goals, user?.uid])
```

## Displaying Progress

### Progress Bar

Shows visual representation of progress:

```typescript
// Calculation
const percent = (currentProgress / goal.targetValue) * 100
const style = { width: `${percent}%` }

// Display
<div className="progress-bar">
  <div className="progress-fill" style={style} />
</div>
<span>{currentProgress} / {goal.targetValue} {goal.unit}</span>
```

### Viewing Progress History

Users can view all logged progress entries for a goal by clicking the history button (📋) on a goal card:

**Features**:
- **Complete history** - See all progress entries ever logged
- **Most recent first** - Latest entries appear at top
- **Friendly dates** - Shows "Today at 2:30 PM", "Yesterday", or "Jan 15, 2024 at 3:45 PM"
- **Notes** - Displays any notes added when logging progress
- **Retroactive indicator** - Shows which entries were logged for past dates
- **Delete entries** - Remove individual progress entries
- **Scrollable** - Browse through many entries easily

**Implementation**:
```typescript
// In GoalCard component
<button
  className="btn-icon"
  onClick={() => onViewHistory(goal)}
  title="View progress history"
>
  📋
</button>

// In DashboardPage component
const handleViewHistoryClick = (goal: Goal) => {
  setSelectedGoal(goal)
  setShowHistoryModal(true)
}

// Render the modal
<ProgressHistoryModal
  isOpen={showHistoryModal}
  goal={selectedGoal}
  onClose={() => setShowHistoryModal(false)}
/>
```

**Progress Item Display**:
```
+30 pages     Today at 2:30 PM
"Read chapter 5"
```

See [07-COMPONENTS.md - ProgressHistoryModal](./07-COMPONENTS.md#progresshistorymodal) for detailed component documentation.

### Current Period Progress

Depends on goal frequency:

```typescript
// For daily goal: Show today's progress
// For weekly goal: Show this week's progress
// For monthly goal: Show this month's progress

const getGoalPeriod = (goal: Goal) => {
  const today = new Date()
  
  if (goal.frequency === 'daily') {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
    }
  }
  // ... weekly and monthly versions
}
```

### Yearly Progress

```typescript
// Sum progress for entire year
const yearStart = new Date(today.getFullYear(), 0, 1)
const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59)

const yearlyProgress = await calculateGoalProgress(
  goalId,
  userId,
  yearStart,
  yearEnd
)

const percentOfYearlyTarget = (yearlyProgress / goal.yearlyTarget) * 100
```

## Key Files

### [src/services/progressService.ts](../src/services/progressService.ts)

All progress-related functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `logProgress()` | Record progress | Promise<Progress> |
| `getGoalProgress()` | Get all progress for a goal | Promise<Progress[]> |
| `calculateGoalProgress()` | Sum progress in date range | Promise<number> |
| `subscribeToGoalProgress()` | Listen for changes | Unsubscribe function |
| `revertProgress()` | Undo a progress entry | Promise<void> |

### [src/components/ProgressLoggerModal.tsx](../src/components/ProgressLoggerModal.tsx)

Modal form for logging progress.

### [src/components/ProgressHistoryModal.tsx](../src/components/ProgressHistoryModal.tsx)

Modal displaying all progress entries for a goal with delete functionality.

## Calculating Progress

### Get Total Progress for a Date Range

```typescript
export async function calculateGoalProgress(
  goalId: string,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    // Query: get all progress entries for this goal in date range
    const constraints = [
      where('goalId', '==', goalId),
      where('userId', '==', userId),
      where('loggedAt', '>=', Timestamp.fromDate(startDate)),
      where('loggedAt', '<=', Timestamp.fromDate(endDate)),
    ]
    
    const q = query(collection(db, 'progress'), ...constraints)
    const snapshot = await getDocs(q)
    
    // Sum all progress values
    let total = 0
    snapshot.forEach((doc) => {
      const progress = doc.data() as Progress
      // Don't count reverted entries
      if (!progress.revertedBy) {
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

### Subscribe to Real-Time Progress

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

  // Listener fires every time progress changes
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const progressEntries = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      // Convert Firestore timestamps to JavaScript Date
      loggedAt: doc.data().loggedAt.toDate(),
    } as Progress))
    
    // Tell component about the changes
    callback(progressEntries)
  })

  return unsubscribe
}
```

## Retroactive Progress

Sometimes users need to log progress for past dates. Example:

```
Goal: "Read 30 pages daily"

Jan 14: Forgot to log 30 pages I read yesterday
Jan 15: Want to log the 30 pages from yesterday
```

### Log Retroactive Progress

```typescript
const handleLogRetroactiveProgress = async (goalId: string, yesterdayDate: Date) => {
  await logProgress(
    goalId,
    user.uid,
    30,  // pages read
    "Retroactive entry for Jan 14",
    yesterdayDate,  // Date parameter
    true  // isRetroactive = true
  )
}
```

### UI for Retroactive Logging

```typescript
// ProgressLoggerModal can have date picker
<label>
  Date
  <input 
    type="date"
    value={date}
    onChange={(e) => setDate(new Date(e.target.value))}
  />
</label>

<label>
  <input 
    type="checkbox"
    checked={isRetroactive}
    onChange={(e) => setIsRetroactive(e.target.checked)}
  />
  This is for a past date
</label>
```

## Reverting Progress

Users might accidentally log wrong amount and want to undo.

### Revert Function

```typescript
export async function revertProgress(progressId: string): Promise<void> {
  try {
    const progressRef = doc(db, 'progress', progressId)
    
    // Mark as reverted (don't delete, keep audit trail)
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

### Why Mark as Reverted (Not Delete)?

```
Audit Trail Example:
Jan 15, 8:30 AM: User logs 25 pages
Jan 15, 8:40 AM: User realizes that was wrong
Jan 15, 8:40 AM: User reverts that entry
        ↓
System keeps all entries (for audit purposes)
But excludes reverted ones from progress calculations
```

## Common Tasks

### Show User's Best Day

```typescript
const getBestDay = (progress: Progress[]) => {
  const dayMap: Record<string, number> = {}
  
  progress.forEach(p => {
    const day = p.loggedAt.toDateString()
    dayMap[day] = (dayMap[day] || 0) + p.value
  })
  
  let bestDay = ''
  let bestValue = 0
  
  Object.entries(dayMap).forEach(([day, value]) => {
    if (value > bestValue) {
      bestDay = day
      bestValue = value
    }
  })
  
  return { day: bestDay, value: bestValue }
}
```

### Show Streak

```typescript
const getStreak = (progress: Progress[], goal: Goal): number => {
  const today = new Date()
  let streak = 0
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toDateString()
    
    const dayProgress = progress
      .filter(p => p.loggedAt.toDateString() === dateString)
      .reduce((sum, p) => sum + p.value, 0)
    
    // Check if goal met for this day
    if (dayProgress >= goal.targetValue) {
      streak++
    } else {
      break  // Streak ended
    }
  }
  
  return streak
}
```

### Export Progress as CSV

```typescript
const exportProgressAsCSV = (progress: Progress[], goal: Goal) => {
  let csv = 'Date,Amount,Notes\n'
  
  progress.forEach(p => {
    csv += `"${p.loggedAt.toLocaleDateString()}","${p.value}","${p.note || ''}"\n`
  })
  
  // Download file
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
  element.setAttribute('download', `${goal.title}-progress.csv`)
  element.click()
}
```

## Troubleshooting

### Progress not updating on screen

1. Check `subscribeToGoalProgress()` is called
2. Ensure user.uid matches
3. Check Firestore rules allow reading progress
4. Look for errors in browser console

### Double-counting progress

This happens if same progress entry shows multiple times:

1. Check if `revertedBy` filter is working
2. Ensure each entry is only counted once
3. Verify timestamp conversion (Firestore → JavaScript)

### Retroactive entries showing in wrong period

1. Check date picker is working correctly
2. Verify `loggedAt` is being set to correct date
3. Check date range calculation in `getGoalPeriod()`

## External Resources

- [Firestore Query Documentation](https://firebase.google.com/docs/firestore/query-data/queries)
- [Timestamp in Firestore](https://firebase.google.com/docs/firestore/manage-data/add-data#timestamp)
- [Array Operations in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)

---

**Related Documentation**:
- [Goals Management](./04-GOALS.md)
- [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)
- [Services Guide](./08-SERVICES.md)
