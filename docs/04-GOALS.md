# Goals Management

This document explains how goals are created, edited, displayed, and deleted in the Goal Tracker app.

## What is a Goal?

A **goal** is something the user wants to track regularly. For example:
- "Read 30 pages per day"
- "Exercise 3 times per week"
- "Save $100 per week"

Each goal has:
- **Title**: What is the goal?
- **Target Value**: How much? (30 pages, 3 times, $100)
- **Unit**: What are we measuring? (pages, times, dollars)
- **Frequency**: How often? (daily, weekly, monthly)
- **Category**: What type? (Health, Learning, Finance)
- **Status**: Is it active or done?

## Goals Architecture

```
DashboardPage
├── Displays list of goals
├── Shows "Create Goal" button
│
CreateGoalModal (when creating new goal)
├── Form to enter goal details
├── Calls goalService.createGoal()
│
GoalCard (for each goal)
├── Shows goal title, target, unit
├── Shows progress bar
├── Has "Edit" and "Delete" buttons
├── Has "Log Progress" button
```

## Key Files

### [src/services/goalService.ts](../src/services/goalService.ts)

Business logic for goals. Handles all goal operations.

**Main Functions**:

| Function | What it does | Returns |
|----------|-------------|---------|
| `getUserGoals(userId)` | Get all goals for a user | Promise<Goal[]> |
| `subscribeToUserGoals(userId, callback)` | Listen for real-time changes | Unsubscribe function |
| `createGoal(userId, goalData)` | Create new goal | Promise<Goal> |
| `updateGoal(goalId, updates)` | Edit existing goal | Promise<void> |
| `deleteGoal(goalId)` | Delete goal | Promise<void> |

### [src/components/CreateGoalModal.tsx](../src/components/CreateGoalModal.tsx)

React component for the create goal form.

### [src/components/GoalCard.tsx](../src/components/GoalCard.tsx)

React component that displays a single goal.

### [src/pages/DashboardPage.tsx](../src/pages/DashboardPage.tsx)

Main page that displays all goals and overall progress.

## How to Create a Goal

### Step 1: User Interaction

User clicks "Create Goal" button in DashboardPage:

```typescript
<button onClick={() => setShowCreateModal(true)}>
  Create Goal
</button>
```

### Step 2: Show Modal

CreateGoalModal component displays:

```typescript
<form onSubmit={handleCreateGoal}>
  <input 
    placeholder="Goal title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
  <input 
    placeholder="Target value"
    type="number"
    value={targetValue}
    onChange={(e) => setTargetValue(Number(e.target.value))}
  />
  <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
    <option>daily</option>
    <option>weekly</option>
    <option>monthly</option>
  </select>
  <button type="submit">Create Goal</button>
</form>
```

### Step 3: Call Service Function

When user submits the form:

```typescript
const handleCreateGoal = async () => {
  try {
    // Call goalService.createGoal()
    const newGoal = await createGoal(user.uid, {
      title,
      targetValue,
      frequency,
      category,
      unit,
      // ... other fields
    })
    
    // Show success message
    setSuccessMessage('Goal created!')
    
    // Close modal
    setShowCreateModal(false)
  } catch (error) {
    setError(error.message)
  }
}
```

### Step 4: Save to Cloud

The `createGoal()` service function:

```typescript
export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
  try {
    // Add to Firebase Firestore
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goalData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    // Return new goal with assigned ID
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

### Step 5: Real-Time Update

Firebase listener automatically updates the UI:

```typescript
// In DashboardPage
useEffect(() => {
  if (!user?.uid) return

  // Subscribe to goal changes
  const unsubscribe = subscribeToUserGoals(user.uid, (loadedGoals) => {
    setGoals(loadedGoals)  // UI updates automatically
  })

  return () => unsubscribe()
}, [user?.uid])
```

## How to Display Goals

### The Goal List

DashboardPage shows all goals:

```typescript
return (
  <div className="dashboard">
    <h1>Your Goals</h1>
    
    {goals.map((goal) => (
      <GoalCard 
        key={goal.id} 
        goal={goal}
        progress={goalProgress[goal.id]}
        onDelete={handleDeleteGoal}
      />
    ))}
  </div>
)
```

### Individual Goal Card

GoalCard component shows a single goal:

```typescript
export function GoalCard({ goal, progress, onDelete }) {
  return (
    <div className="goal-card">
      <h3>{goal.title}</h3>
      
      <p className="target">
        Target: {goal.targetValue} {goal.unit}
      </p>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(progress / goal.targetValue) * 100}%` }}
        />
      </div>
      
      <p className="progress-text">
        {progress} / {goal.targetValue} {goal.unit}
      </p>
      
      <button onClick={() => onDelete(goal.id)}>Delete</button>
    </div>
  )
}
```

## How to Edit a Goal

### User Interaction

Users click the pencil (✏️) icon on a goal card to edit:

```typescript
<button
  className="btn-icon"
  onClick={() => onEdit(goal)}
  title="Edit goal"
  aria-label="Edit goal"
>
  ✏️
</button>
```

### Modal Components

Two modal components handle goal editing:

| Component | Purpose | When Used |
|-----------|---------|-----------|
| [CreateGoalModal.tsx](../src/components/CreateGoalModal.tsx) | Create new goals | New goal creation |
| [EditGoalModal.tsx](../src/components/EditGoalModal.tsx) | Edit existing goals | Editing goal details |

### EditGoalModal Component

The `EditGoalModal` is extensible and can be enhanced to support additional features in the future (e.g., viewing goal history, editing goal rules):

```typescript
interface EditGoalModalProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  onSave: (goalId: string, updates: Partial<Goal>) => Promise<void>
  isLoading?: boolean
}

export function EditGoalModal({
  isOpen,
  goal,
  onClose,
  onSave,
  isLoading = false,
}: EditGoalModalProps) {
  // Form fields that can be edited:
  // - title
  // - description
  // - category
  // - frequency
  // - targetValue
  // - unit
  // - priority
  // - color
}
```

### Update Service Function

```typescript
export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goalId)
    
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: Timestamp.now(),  // Update timestamp
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}
```

### Use in DashboardPage

```typescript
const handleEditGoalClick = (goal: Goal) => {
  setSelectedGoal(goal)
  setShowEditModal(true)
}

const handleSaveGoal = async (goalId: string, updates: Partial<Goal>) => {
  try {
    setIsLoading(true)
    await updateGoal(goalId, updates)
    setShowEditModal(false)
    // Firebase listener automatically updates UI
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update goal')
  } finally {
    setIsLoading(false)
  }
}

// Render the modal
<EditGoalModal
  isOpen={showEditModal}
  goal={selectedGoal}
  onClose={() => setShowEditModal(false)}
  onSave={handleSaveGoal}
  isLoading={isLoading}
/>
```

## How to Delete a Goal

### Service Function

```typescript
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goalId)
    await deleteDoc(goalRef)
    
    // Also delete all progress entries for this goal
    const progressEntries = await getGoalProgress(goalId)
    for (const entry of progressEntries) {
      await deleteDoc(doc(db, 'progress', entry.id))
    }
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}
```

### Use in Component

```typescript
const handleDeleteGoal = async (goalId: string) => {
  if (!confirm('Are you sure you want to delete this goal?')) {
    return  // User cancelled
  }

  try {
    await deleteGoal(goalId)
    // Firebase listener automatically removes from UI
  } catch (error) {
    setError('Failed to delete goal: ' + error.message)
  }
}
```

## Goal Status

Goals have different statuses:

| Status | Meaning | UI Behavior |
|--------|---------|-------------|
| `active` | User is tracking this goal | Show in main list |
| `archived` | Not currently tracking | Hide from main list |
| `completed` | Goal finished for the year | Mark as completed |

### Change Goal Status

```typescript
// Mark goal as complete
await updateGoal(goalId, {
  status: 'completed',
  completedDate: new Date()
})

// Archive goal (stop tracking without deleting)
await updateGoal(goalId, {
  status: 'archived'
})

// Reactivate goal
await updateGoal(goalId, {
  status: 'active'
})
```

## Frequency: What Does It Mean?

The `frequency` field determines when progress is tracked:

```typescript
frequency: 'daily' | 'weekly' | 'monthly'

// Example: "Read 30 pages daily"
// User should log 30 pages every day
// Progress resets each day

// Example: "Exercise 3 times weekly"
// User should log 3 sessions per week
// Progress resets each week (Monday-Sunday)

// Example: "Save $100 monthly"
// User should save $100 every month
// Progress resets on 1st of each month
```

### How Frequency Affects Progress Calculation

```typescript
// From DashboardPage.tsx
const getGoalPeriod = (goal: Goal) => {
  const today = new Date()
  
  if (goal.frequency === 'daily') {
    // Start: midnight today
    // End: 11:59pm today
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    return { start: startDate, end: endDate }
  }
  
  if (goal.frequency === 'weekly') {
    // Start: Sunday of this week
    // End: Saturday 11:59pm
    const dayOfWeek = today.getDay()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek)
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - dayOfWeek), 23, 59, 59)
    return { start: startDate, end: endDate }
  }
  
  if (goal.frequency === 'monthly') {
    // Start: 1st of this month
    // End: last day of month 11:59pm
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    return { start: startDate, end: endDate }
  }
}
```

## Yearly Target

Each goal can have a `yearlyTarget` - the total amount to achieve in a year:

```typescript
const goal = {
  title: "Read 30 pages daily",
  targetValue: 30,
  unit: "pages",
  frequency: "daily",
  yearlyTarget: 10950  // 30 × 365 days
}

// Yearly progress = sum of all daily progress for the year
const yearlyProgress = 5475  // pages read so far this year
const percentComplete = (5475 / 10950) * 100  // 50%
```

## Common Tasks

### Show Only Active Goals

```typescript
const activeGoals = goals.filter(goal => goal.status === 'active')
```

### Calculate Completion Percentage

```typescript
const percentComplete = (currentProgress / goal.targetValue) * 100
```

### Check if Goal is Due Today

```typescript
const isDueToday = goal.frequency === 'daily'

const isDueThisWeek = goal.frequency === 'weekly'

const isDueThisMonth = goal.frequency === 'monthly'
```

### Sort Goals by Priority

```typescript
const priorityOrder = { high: 1, medium: 2, low: 3 }
const sortedGoals = [...goals].sort((a, b) => {
  return priorityOrder[a.priority] - priorityOrder[b.priority]
})
```

## Troubleshooting

### Goals not appearing after creation

1. Check that `subscribeToUserGoals()` is set up correctly
2. Ensure Firestore rules allow reading/writing
3. Check browser console for errors

### Edit changes not showing

1. Ensure `updateGoal()` is being called
2. Check that Firebase listener is active
3. Verify Firestore rules allow updates

### Deletion fails with permission error

1. Check that user's `uid` matches the goal's `userId`
2. Check Firestore security rules
3. Ensure user is authenticated

## External Resources

- [Firestore Document Reference](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Real-time Listeners](https://firebase.google.com/docs/firestore/query-data/listen)

---

**Related Documentation**:
- [Progress Tracking](./05-PROGRESS-TRACKING.md)
- [Services Guide](./08-SERVICES.md)
- [Components Guide](./07-COMPONENTS.md)
