# Data Types & TypeScript

This document explains the data structures used throughout the Goal Tracker application.

## What is TypeScript?

[TypeScript](https://www.typescriptlang.org/) is JavaScript with **type safety**. It helps catch errors before the code runs by declaring what type each piece of data should be.

```typescript
// Regular JavaScript (risky - value could be anything)
const title = getGoal()
console.log(title.toUpperCase()) // What if it's null or a number?

// TypeScript (safe - we know exactly what we have)
const title: string = getGoal()
console.log(title.toUpperCase()) // TypeScript guarantees this is safe
```

### Key TypeScript Concepts for This Project

- **Interface**: Defines the shape of an object (what properties it should have)
- **Type**: Similar to Interface, but more flexible
- **Union**: Can be one of several types (`'daily' | 'weekly' | 'monthly'` means one of these)
- **Optional**: Property might not exist (`description?: string`)
- **Readonly**: Property cannot be changed (`readonly id: string`)

## Core Data Types

All types are defined in [src/types/index.ts](../src/types/index.ts).

### 1. User

Represents a logged-in user.

```typescript
interface User {
  uid: string                    // Unique ID from Firebase
  email: string                  // User's email
  displayName?: string           // Optional: user's display name
  photoURL?: string              // Optional: user's profile photo
  createdAt: Date                // When account was created
  updatedAt: Date                // When account was last updated
  settings: UserSettings         // User preferences
  lastSyncTime: Date             // Last time data was synced with cloud
}
```

**Example**:
```typescript
const user: User = {
  uid: "abc123",
  email: "john@example.com",
  displayName: "John Smith",
  photoURL: "https://...",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
  settings: {
    theme: 'light',
    timezone: 'America/New_York',
    notificationsEnabled: true,
    dataExportFormat: 'csv'
  },
  lastSyncTime: new Date()
}
```

### 2. UserSettings

User's preferences and configuration.

```typescript
interface UserSettings {
  theme: 'light' | 'dark'                    // UI theme preference
  timezone: string                           // User's timezone (e.g., "America/New_York")
  notificationsEnabled: boolean              // Should notify user?
  dataExportFormat: 'csv' | 'json' | 'pdf'   // Preferred export format
}
```

### 3. Goal

A goal the user wants to track.

```typescript
interface Goal {
  id: string                          // Unique ID
  userId: string                      // Who owns this goal
  title: string                       // Goal name (e.g., "Read 30 pages")
  description?: string                // Optional: longer explanation
  category: string                    // Category (e.g., "Learning", "Health")
  frequency: 'daily' | 'weekly' | 'monthly'  // How often is it tracked?
  targetValue: number                 // What's the target? (e.g., 30)
  unit: string                        // What are we measuring? (e.g., "pages", "miles")
  createdAt: Date                     // When goal was created
  updatedAt: Date                     // When goal was last modified
  status: 'active' | 'archived' | 'completed'  // Goal state
  completedDate?: Date                // Optional: when goal was completed
  yearlyTarget?: number               // Optional: total for the year
  priority: 'low' | 'medium' | 'high' // Goal importance
  color: string                       // Hex color for UI (e.g., "#FF5733")
  notes?: string                      // Optional: extra notes
  localChanges?: boolean              // Internal: has it changed locally?
  lastModifiedLocallyAt?: number      // Internal: timestamp for sync
}
```

**Example**:
```typescript
const goal: Goal = {
  id: "goal_123",
  userId: "user_abc",
  title: "Read 30 pages",
  description: "Read from my current book",
  category: "Learning",
  frequency: "daily",
  targetValue: 30,
  unit: "pages",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
  status: "active",
  yearlyTarget: 10950,  // 30 pages × 365 days
  priority: "high",
  color: "#3498DB"  // Blue
}
```

### 4. Progress

A record of progress toward a goal.

```typescript
interface Progress {
  id: string                      // Unique ID
  goalId: string                  // Which goal does this relate to?
  userId: string                  // Who owns this progress entry?
  value: number                   // How much progress was made? (e.g., 25)
  note?: string                   // Optional: why this amount?
  loggedAt: Date                  // When was this logged?
  timestamp: Date                 // Backup timestamp
  isRetroactive: boolean          // Is this for a past date?
  revertedBy?: string             // If reverted, who reverted it?
  metadata?: {
    deviceId: string              // Which device created this?
    syncStatus: 'pending' | 'synced'  // Synced with cloud?
  }
}
```

**Example**:
```typescript
const progress: Progress = {
  id: "progress_456",
  goalId: "goal_123",
  userId: "user_abc",
  value: 25,  // User read 25 pages
  note: "Finished chapter 3",
  loggedAt: new Date("2024-01-15 08:30:00"),
  timestamp: new Date("2024-01-15 08:30:00"),
  isRetroactive: false,
  metadata: {
    deviceId: "device_xyz",
    syncStatus: 'synced'
  }
}
```

## How Types Are Used

### In Components

```typescript
import type { Goal } from '@/types'

interface GoalCardProps {
  goal: Goal                          // Expects a Goal object
  onDelete: (goalId: string) => void  // Function that takes a string
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  return (
    <div>
      <h3>{goal.title}</h3>
      <p>Target: {goal.targetValue} {goal.unit}</p>
      <button onClick={() => onDelete(goal.id)}>Delete</button>
    </div>
  )
}
```

### In Services

```typescript
// Function signature tells you exactly what it expects and returns
export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
  // Omit<Goal, ...> means "Goal type but without these properties"
  // Promise<Goal> means "this function returns a Goal (eventually)"
}
```

### In State

```typescript
import { useState } from 'react'
import type { Goal } from '@/types'

export function GoalList() {
  // TypeScript knows goals is an array of Goal objects
  const [goals, setGoals] = useState<Goal[]>([])
  
  // ✅ TypeScript allows this
  setGoals([{ id: "1", userId: "u1", title: "Read", ... }])
  
  // ❌ TypeScript prevents this (wrong data type)
  setGoals("not an array of goals")
}
```

## Optional vs Required Properties

In TypeScript, properties can be optional using `?`:

```typescript
interface Goal {
  id: string              // REQUIRED - always present
  title: string           // REQUIRED - always present
  description?: string    // OPTIONAL - might be undefined
  completedDate?: Date    // OPTIONAL - only if goal is completed
}

// This works - we provided required fields
const goal1: Goal = {
  id: "1",
  title: "Read"
}

// This fails - missing required field
const goal2: Goal = {
  id: "1"
  // Error: title is required!
}
```

## Union Types

When something can be one of several specific values:

```typescript
// Without Union Type (risky)
frequency: string  // Could be "daily", "weekly", "hourly", "yearly"... confusing!

// With Union Type (safe)
frequency: 'daily' | 'weekly' | 'monthly'  // Only these 3 options allowed

// Example:
const goal = {
  frequency: 'daily'      // ✅ Allowed
}

const goal2 = {
  frequency: 'yearly'     // ❌ Not allowed - only daily, weekly, or monthly
}
```

## readonly Properties

Some properties should never change:

```typescript
interface Goal {
  readonly id: string      // Never changes once created
  readonly userId: string  // Can't reassign to different user
  readonly createdAt: Date // When created, stays the same
  status: string           // Can change from 'active' to 'completed'
}

goal.id = "different"      // ❌ Error - id is readonly!
goal.status = "completed"  // ✅ Allowed - status is not readonly
```

## Generic Types (Advanced)

Reusable type definitions that work with any data type:

```typescript
// Without generics - only works with strings
interface Container {
  value: string
  get(): string
  set(v: string): void
}

// With generics - works with any type
interface Container<T> {
  value: T
  get(): T
  set(v: T): void
}

// Usage:
const stringContainer: Container<string> = { ... }
const numberContainer: Container<number> = { ... }
const goalContainer: Container<Goal> = { ... }
```

## Type Helpers

TypeScript provides useful type helpers:

```typescript
// Omit: Remove some properties from a type
type GoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
// Result: Goal without id, createdAt, updatedAt

// Partial: Make all properties optional
type PartialGoal = Partial<Goal>
// Result: All Goal properties become optional

// Pick: Keep only certain properties
type GoalSummary = Pick<Goal, 'id' | 'title' | 'status'>
// Result: Only id, title, and status
```

## Common Patterns

### API Response Type

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Usage:
const response: ApiResponse<Goal> = await fetchGoal()
if (response.success && response.data) {
  console.log(response.data.title)
}
```

### Callback Function Type

```typescript
// Function that takes nothing, returns nothing
const onDelete: () => void = () => console.log('deleted')

// Function that takes a Goal, returns a Promise of void
const onSave: (goal: Goal) => Promise<void> = async (goal) => {
  await saveGoal(goal)
}
```

## Checking Your Types

Run this command to check for type errors:

```bash
npm run type-check
```

This won't run the code, just checks if your types are correct.

## External Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-for-js-programmers.html)
- [Interfaces in TypeScript](https://www.typescriptlang.org/docs/handbook/2/objects.html)

---

**Related Documentation**:
- [Architecture Overview](./01-ARCHITECTURE.md)
- [Services Guide](./08-SERVICES.md)
- [Glossary](./GLOSSARY.md)
