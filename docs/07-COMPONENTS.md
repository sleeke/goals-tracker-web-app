# Components Guide

This document explains the React components in the Goal Tracker app.

## What are Components?

In React, components are reusable UI building blocks. Think of them like LEGO pieces:

```
LEGO analogy:
┌─────────────────────────────────────────┐
│ Complete LEGO house (App)               │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌─────┐   │
│  │ Roof     │  │ Wall     │  │Door │   │
│  │Component │  │Component │  │Comp │   │
│  └──────────┘  └──────────┘  └─────┘   │
│  ┌──────────┐  ┌──────────┐            │
│  │ Window   │  │ Window   │            │
│  │Component │  │Component │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘

React Components:
- Are reusable pieces of UI
- Can have internal state (useState)
- Receive data via props
- Return JSX (HTML-like code)
```

## Component Structure

```
src/components/
├── CreateGoalModal.tsx       # Modal for creating goals
├── GoalCard.tsx              # Displays single goal
├── GoalCard.css              # Styling for GoalCard
├── ProgressLoggerModal.tsx   # Modal for logging progress
├── ProgressLogger.css        # Styling for progress
└── __tests__/                # Test files
    ├── GoalCard.test.tsx
    └── ProgressLoggerModal.test.tsx

src/pages/
├── DashboardPage.tsx         # Main dashboard
├── DashboardPage.css         # Dashboard styling
├── LoginPage.tsx             # Login form
├── SignupPage.tsx            # Signup form
└── AuthPages.css             # Auth styling
```

## Component Hierarchy

```
App.tsx (Root)
├── AuthContext.Provider (Provides user data)
│   ├── LoginPage (When not authenticated)
│   │   └── Login Form
│   │
│   ├── SignupPage (When signing up)
│   │   └── Signup Form
│   │
│   └── DashboardPage (When authenticated)
│       ├── CreateGoalModal
│       │   └── Form inputs
│       │
│       ├── GoalCard (×many, one per goal)
│       │   ├── Goal info display
│       │   ├── Progress bar
│       │   └── Action buttons
│       │
│       └── ProgressLoggerModal
│           └── Form for logging progress
```

## Key Components

### DashboardPage

**File**: [src/pages/DashboardPage.tsx](../src/pages/DashboardPage.tsx)

**Purpose**: Main page showing all goals and progress.

**What it does**:
- Displays list of goals
- Shows current period progress for each goal
- Shows yearly progress
- Allows creating new goals
- Allows logging progress

**Key Props**: None (uses AuthContext for user)

**Key State**:
```typescript
const [goals, setGoals] = useState<Goal[]>([])
const [goalProgress, setGoalProgress] = useState<Record<string, number>>({})
const [yearlyProgress, setYearlyProgress] = useState<Record<string, number>>({})
const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
```

**Example Usage**:
```typescript
import { DashboardPage } from '@/pages/DashboardPage'

// In App.tsx
if (user) {
  return <DashboardPage />
}
```

**How to Modify**:
- Change layout: Modify JSX structure
- Add new display: Add new sections
- Change styling: Edit `DashboardPage.css`
- Add features: Add new state and effects

### GoalCard

**File**: [src/components/GoalCard.tsx](../src/components/GoalCard.tsx)

**Purpose**: Display a single goal with progress.

**What it does**:
- Shows goal title and target
- Displays progress bar
- Shows current period progress
- Has buttons to edit/delete/log progress

**Props**:
```typescript
interface GoalCardProps {
  goal: Goal
  progress: number
  yearlyProgress?: number
  onDelete: (goalId: string) => void
  onLogProgress: (goalId: string) => void
  onEdit?: (goal: Goal) => void
}
```

**Example Usage**:
```typescript
import { GoalCard } from '@/components/GoalCard'

export function DashboardPage() {
  return (
    <div>
      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          progress={goalProgress[goal.id]}
          onDelete={handleDeleteGoal}
          onLogProgress={handleLogProgress}
        />
      ))}
    </div>
  )
}
```

**How to Modify**:
- Change what's displayed: Edit JSX in component
- Add progress visualization: Modify progress bar HTML
- Add buttons: Add new onClick handlers
- Change styling: Edit `GoalCard.css`

### CreateGoalModal

**File**: [src/components/CreateGoalModal.tsx](../src/components/CreateGoalModal.tsx)

**Purpose**: Modal form for creating new goals.

**What it does**:
- Shows form with goal fields
- Validates inputs
- Calls goalService.createGoal()
- Closes modal on success

**Props**:
```typescript
interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess?: (goal: Goal) => void
}
```

**Example Usage**:
```typescript
import { CreateGoalModal } from '@/components/CreateGoalModal'

export function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowCreateModal(true)}>
        Create Goal
      </button>

      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user.uid}
      />
    </>
  )
}
```

**How to Modify**:
- Add fields: Add input elements and state
- Validate: Add validation logic before submit
- Change behavior: Modify onSubmit handler
- Update styling: Edit `GoalModal.css`

### ProgressLoggerModal

**File**: [src/components/ProgressLoggerModal.tsx](../src/components/ProgressLoggerModal.tsx)

**Purpose**: Modal form for logging progress.

**What it does**:
- Shows form with progress value and note
- Allows selecting date (for retroactive logging)
- Calls progressService.logProgress()
- Closes modal on success

**Props**:
```typescript
interface ProgressLoggerModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal
  userId: string
  onSuccess?: (progress: Progress) => void
}
```

**Example Usage**:
```typescript
import { ProgressLoggerModal } from '@/components/ProgressLoggerModal'

export function DashboardPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showProgressLogger, setShowProgressLogger] = useState(false)

  return (
    <>
      <button onClick={() => {
        setSelectedGoal(goal)
        setShowProgressLogger(true)
      }}>
        Log Progress
      </button>

      {selectedGoal && (
        <ProgressLoggerModal
          isOpen={showProgressLogger}
          onClose={() => setShowProgressLogger(false)}
          goal={selectedGoal}
          userId={user.uid}
        />
      )}
    </>
  )
}
```

**How to Modify**:
- Add fields: Add inputs for additional data
- Change validation: Modify validation logic
- Add options: Add dropdown or checkboxes
- Update styling: Edit `ProgressLogger.css`

## Page Components (Full Screen)

### LoginPage

**File**: [src/pages/LoginPage.tsx](../src/pages/LoginPage.tsx)

**Purpose**: User login form.

**What it does**:
- Shows email and password inputs
- Calls auth.login()
- Displays error messages
- Redirects to DashboardPage on success

### SignupPage

**File**: [src/pages/SignupPage.tsx](../src/pages/SignupPage.tsx)

**Purpose**: User signup form.

**What it does**:
- Shows email, password, and confirm password inputs
- Validates passwords match
- Calls auth.signup()
- Displays error messages
- Redirects to DashboardPage on success

## React Concepts Used

### useState Hook

Manages component state:

```typescript
const [goals, setGoals] = useState<Goal[]>([])

// goals: current value
// setGoals: function to update it
// <Goal[]>: TypeScript type (array of Goals)
// []: initial value (empty array)

// Update state:
setGoals([...goals, newGoal])  // Add goal
setGoals(goals.filter(g => g.id !== goalId))  // Remove goal
```

### useEffect Hook

Run code when component mounts or data changes:

```typescript
useEffect(() => {
  // This code runs once when component mounts
  loadGoals()
  
  return () => {
    // Cleanup code runs before unmount or next effect
    unsubscribe()
  }
}, [user?.uid])  // Re-run if user.uid changes
```

### Props

Pass data from parent to child component:

```typescript
// Parent:
<GoalCard goal={myGoal} onDelete={handleDelete} />

// Child:
export function GoalCard({ goal, onDelete }) {
  // goal and onDelete are available here
  return <div>{goal.title}</div>
}
```

### Conditional Rendering

Show/hide elements based on conditions:

```typescript
return (
  <>
    {user ? (
      <DashboardPage />
    ) : (
      <LoginPage />
    )}
    
    {isLoading && <LoadingSpinner />}
    
    {error && <ErrorMessage error={error} />}
  </>
)
```

## Common Patterns

### Modal Pattern

```typescript
const [isOpen, setIsOpen] = useState(false)

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open Modal</button>
    
    {isOpen && (
      <div className="modal">
        <div className="modal-content">
          <button onClick={() => setIsOpen(false)}>Close</button>
          {/* Modal content */}
        </div>
      </div>
    )}
  </>
)
```

### Form Handling

```typescript
const [formData, setFormData] = useState({ title: '', target: 0 })

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()  // Prevent page reload
  
  try {
    await createGoal(formData)
    setFormData({ title: '', target: 0 })  // Reset form
  } catch (error) {
    setError(error.message)
  }
}

return (
  <form onSubmit={handleSubmit}>
    <input
      value={formData.title}
      onChange={(e) => setFormData({
        ...formData,
        title: e.target.value
      })}
    />
    <button type="submit">Submit</button>
  </form>
)
```

### List Rendering

```typescript
return (
  <ul>
    {goals.map((goal) => (
      <li key={goal.id}>
        {goal.title}
        <button onClick={() => handleDelete(goal.id)}>Delete</button>
      </li>
    ))}
  </ul>
)
```

## Common Tasks

### Add a New Component

1. Create file: `src/components/MyComponent.tsx`
2. Define TypeScript interface for props:
```typescript
interface MyComponentProps {
  title: string
  onAction: () => void
}
```
3. Write component:
```typescript
export function MyComponent({ title, onAction }: MyComponentProps) {
  return <div onClick={onAction}>{title}</div>
}
```
4. Use in other components:
```typescript
<MyComponent title="Click me" onAction={handleClick} />
```

### Add State to Component

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleClick = async () => {
  setIsLoading(true)
  try {
    await doSomething()
  } finally {
    setIsLoading(false)
  }
}
```

### Add Error Handling

```typescript
const [error, setError] = useState<string | null>(null)

const handleAction = async () => {
  setError(null)
  try {
    await action()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  }
}

return (
  <>
    {error && <p className="error">{error}</p>}
    <button onClick={handleAction}>Do something</button>
  </>
)
```

## Debugging Components

### React DevTools

Install [React DevTools browser extension](https://react-devtools-tutorial.vercel.app/):

```
Inspect components → See their state and props
Watch state changes in real-time
```

### Console Logging

```typescript
export function MyComponent() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Component mounted or count changed:', count)
  }, [count])

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## External Resources

- [React Components](https://react.dev/learn)
- [useState Hook](https://react.dev/reference/react/useState)
- [useEffect Hook](https://react.dev/reference/react/useEffect)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)

---

**Related Documentation**:
- [Services Guide](./08-SERVICES.md)
- [Architecture Overview](./01-ARCHITECTURE.md)
- [Glossary](./GLOSSARY.md) - Look up: "Component", "Props", "Hook", "State"
