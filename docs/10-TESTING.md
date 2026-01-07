# Testing Guide

This document explains how to test the Goal Tracker application.

## Testing Overview

**Testing** means writing code to verify that your code works correctly. It catches bugs before users do!

```
Without Tests:
Code change → Deploy → Users find bug → Emergency fix ❌

With Tests:
Code change → Tests run → Tests pass ✅ → Deploy ✅
Code change → Tests run → Tests fail ❌ → Fix before deploy
```

## Three Types of Tests

### 1. Unit Tests

Test individual functions in isolation.

```typescript
// Test: calculateGoalProgress function
describe('calculateGoalProgress', () => {
  it('sums progress for a date range', async () => {
    const total = await calculateGoalProgress(goalId, userId, start, end)
    
    expect(total).toBe(30)  // Should equal 30
  })
})
```

**When to use**: Testing services, utilities, pure functions

### 2. Component Tests

Test React components in isolation.

```typescript
// Test: GoalCard component renders correctly
describe('GoalCard', () => {
  it('displays goal title', () => {
    const { getByText } = render(
      <GoalCard goal={mockGoal} progress={20} />
    )
    
    expect(getByText('Read 30 pages')).toBeInTheDocument()
  })
})
```

**When to use**: Testing components, UI logic

### 3. E2E Tests (End-to-End)

Test entire user flows in real browser.

```typescript
// Test: User can create a goal and log progress
test('Create goal and log progress', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  
  // Fill in login form
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  
  // Click login button
  await page.click('button:has-text("Login")')
  
  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="goal-list"]')
  
  // Create goal
  await page.click('button:has-text("Create Goal")')
  await page.fill('input[name="title"]', 'Read 30 pages')
  await page.click('button:has-text("Create")')
  
  // Verify goal appears
  expect(page.locator('text=Read 30 pages')).toBeVisible()
})
```

**When to use**: Testing complete user journeys, integration testing

## Test Files Location

```
src/
├── services/
│   └── __tests__/
│       ├── goalService.test.ts       # Unit tests
│       └── progressService.test.ts
│
├── components/
│   └── __tests__/
│       ├── GoalCard.test.tsx         # Component tests
│       └── ProgressLoggerModal.test.tsx
│
e2e/
├── basic.spec.ts                    # Basic E2E tests
├── goal-tracker.spec.ts             # Feature tests
└── ui-check.spec.ts                 # UI verification

features/
├── goal-management.feature          # BDD tests (Cucumber)
├── progress-tracking.feature
└── step_definitions/
    └── steps.ts
```

## Unit Testing with Vitest

### Setup

Already configured in `vitest.config.ts` and `src/test/setup.ts`.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file change)
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Unit Tests

**Example**: Test the `createGoal` service function

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createGoal, deleteGoal } from '@/services/goalService'

describe('goalService', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset any mocks
  })

  // Cleanup after each test
  afterEach(async () => {
    // Delete test data from Firestore
  })

  it('creates a goal with correct data', async () => {
    // Arrange: Prepare test data
    const userId = 'test-user-123'
    const goalData = {
      title: 'Test Goal',
      targetValue: 30,
      unit: 'pages',
      frequency: 'daily' as const,
      category: 'Learning',
      priority: 'high' as const,
      color: '#FF0000',
      status: 'active' as const,
    }

    // Act: Call the function
    const result = await createGoal(userId, goalData)

    // Assert: Check the result
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.title).toBe('Test Goal')
    expect(result.targetValue).toBe(30)
    expect(result.userId).toBe(userId)
    expect(result.createdAt).toBeDefined()
  })

  it('throws error for invalid data', async () => {
    // Test error case
    await expect(
      createGoal('user', {
        title: '',  // Empty title
        targetValue: 30,
        // ... other fields
      })
    ).rejects.toThrow()
  })
})
```

### Common Assertions

```typescript
// Check values
expect(value).toBe(expected)           // Exact match
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // true, non-zero, non-empty
expect(value).toBeFalsy()              // false, 0, null, undefined

// Check types
expect(value).toBeDefined()            // Not undefined
expect(value).toBeNull()               // Is null
expect(value).toBeInstanceOf(Goal)     // Is instance of class

// Check arrays
expect(array).toContain(item)          // Contains item
expect(array).toHaveLength(3)          // Has 3 items
expect(array).toEqual([1, 2, 3])       // Exact array match

// Check errors
await expect(func()).rejects.toThrow() // Throws error
await expect(func()).rejects.toThrow('specific message')

// Check mocks (spies)
expect(mockFn).toHaveBeenCalled()      // Called at least once
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveReturnedWith(value)
```

## Component Testing with React Testing Library

### Example: Test GoalCard Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { GoalCard } from '@/components/GoalCard'
import type { Goal } from '@/types'

describe('GoalCard', () => {
  const mockGoal: Goal = {
    id: 'goal-1',
    userId: 'user-1',
    title: 'Read 30 pages',
    targetValue: 30,
    unit: 'pages',
    frequency: 'daily',
    category: 'Learning',
    priority: 'high',
    color: '#3498DB',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('renders goal title', () => {
    render(
      <GoalCard 
        goal={mockGoal} 
        progress={15}
        onDelete={() => {}}
        onLogProgress={() => {}}
      />
    )

    expect(screen.getByText('Read 30 pages')).toBeInTheDocument()
  })

  it('displays progress bar correctly', () => {
    const { container } = render(
      <GoalCard 
        goal={mockGoal} 
        progress={15}
        onDelete={() => {}}
        onLogProgress={() => {}}
      />
    )

    const progressFill = container.querySelector('.progress-fill') as HTMLElement
    const percent = (15 / 30) * 100  // 50%
    expect(progressFill.style.width).toBe(`${percent}%`)
  })

  it('calls onDelete when delete button clicked', () => {
    const handleDelete = vi.fn()
    
    render(
      <GoalCard 
        goal={mockGoal} 
        progress={15}
        onDelete={handleDelete}
        onLogProgress={() => {}}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalledWith('goal-1')
  })

  it('calls onLogProgress when log progress button clicked', () => {
    const handleLogProgress = vi.fn()
    
    render(
      <GoalCard 
        goal={mockGoal} 
        progress={15}
        onDelete={() => {}}
        onLogProgress={handleLogProgress}
      />
    )

    const logButton = screen.getByRole('button', { name: /log progress/i })
    fireEvent.click(logButton)

    expect(handleLogProgress).toHaveBeenCalledWith('goal-1')
  })
})
```

### Helpful Queries

```typescript
// Get by accessible name (recommended)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Password')

// Get by text
screen.getByText('Welcome')
screen.getByText(/welcome/i)  // Case-insensitive regex

// Get by placeholder
screen.getByPlaceholderText('Enter name')

// Get by test ID (last resort)
screen.getByTestId('user-form')
```

### Async Operations

```typescript
// Wait for element to appear
await screen.findByText('Goal created!')

// Wait for condition
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// User interactions
await userEvent.type(screen.getByRole('textbox'), 'Text to type')
await userEvent.click(screen.getByRole('button'))
```

## E2E Testing with Playwright

### Setup

Already configured in `playwright.config.ts`.

### Running Tests

```bash
# Run all E2E tests
npm run e2e

# Run with visible browser
npm run e2e:headed

# Debug mode
npm run e2e:debug

# Run single file
npx playwright test e2e/goal-tracker.spec.ts

# Run single test
npx playwright test -g "user can create a goal"
```

### Writing E2E Tests

**File**: `e2e/goal-tracker.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Goal Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Before each test, navigate to home
    await page.goto('/')
  })

  test('user can create a goal', async ({ page }) => {
    // Click "Create Goal" button
    await page.click('button:has-text("Create Goal")')

    // Fill in form
    await page.fill('input[name="title"]', 'Read 30 pages')
    await page.fill('input[name="targetValue"]', '30')
    await page.selectOption('select[name="frequency"]', 'daily')

    // Submit form
    await page.click('button:has-text("Create")')

    // Wait for success message
    await expect(page.locator('text=Goal created')).toBeVisible()

    // Verify goal appears in list
    await expect(page.locator('text=Read 30 pages')).toBeVisible()
  })

  test('user can log progress', async ({ page }) => {
    // Assume goal exists, click log progress
    await page.click('button:has-text("Log Progress")')

    // Fill in progress
    await page.fill('input[name="value"]', '25')
    await page.fill('textarea[name="note"]', 'Finished chapter 3')

    // Submit
    await page.click('button:has-text("Log")')

    // Verify update
    await expect(page.locator('text=25 / 30 pages')).toBeVisible()
  })

  test('user can delete a goal', async ({ page }) => {
    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify goal removed
    await expect(page.locator('text=Goal deleted')).toBeVisible()
  })
})
```

### Playwright Selectors

```typescript
// CSS selector
page.click('.goal-card button')
page.fill('input[name="title"]', 'value')

// Text content
page.click('button:has-text("Delete")')
page.locator('text=Welcome').isVisible()

// Role selectors (accessible)
page.getByRole('button', { name: /delete/i })
page.getByRole('textbox', { name: 'Goal title' })

// Test IDs
page.getByTestId('goal-list')
page.getByTestId('create-button')
```

### Useful Assertions

```typescript
// Visibility
await expect(page.locator('.goal')).toBeVisible()
await expect(page.locator('.modal')).toBeHidden()

// Text content
await expect(page.locator('h1')).toContainText('Dashboard')
await expect(page.locator('h1')).toHaveText('Dashboard')

// Value
await expect(page.locator('input')).toHaveValue('text')

// Count
await expect(page.locator('.goal-card')).toHaveCount(5)

// URL
await expect(page).toHaveURL('/dashboard')
```

## BDD Testing with Cucumber

### Feature Files

**File**: `features/goal-management.feature`

```gherkin
Feature: Goal Management
  As a user
  I want to create and manage goals
  So that I can track my progress

  Scenario: Create a new goal
    Given I am logged in
    When I create a goal with title "Read 30 pages" and target 30
    Then the goal should appear in my goal list
    And the progress should show "0 / 30 pages"

  Scenario: Edit an existing goal
    Given I have a goal "Read 30 pages"
    When I edit the goal to have target 45
    Then the goal should show target 45
    And progress should be "0 / 45 pages"

  Scenario: Delete a goal
    Given I have a goal "Read 30 pages"
    When I delete the goal
    Then the goal should be removed from my list
    And I should see a confirmation message
```

### Step Definitions

**File**: `features/step_definitions/steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber'
import type { World } from '../world'

Given('I am logged in', async function(this: World) {
  // Login logic
  await this.page?.goto('/login')
  // ... fill form and submit
})

When('I create a goal with title {string} and target {int}', 
  async function(this: World, title: string, target: number) {
    await this.page?.click('button:has-text("Create Goal")')
    await this.page?.fill('input[name="title"]', title)
    await this.page?.fill('input[name="targetValue"]', target.toString())
    await this.page?.click('button:has-text("Create")')
  }
)

Then('the goal should appear in my goal list',
  async function(this: World) {
    const title = this.goalTitle  // Saved in previous step
    const element = await this.page?.locator(`text=${title}`)
    expect(element).toBeVisible()
  }
)
```

### Running BDD Tests

```bash
# Run BDD tests
npm run bdd

# Run specific feature
npx cucumber-js features/goal-management.feature

# Run with tags
npx cucumber-js --tags "@wip"
```

## Test Coverage

Check how much code is tested:

```bash
npm run test:coverage
```

Output shows:
```
File                    | Statements | Branches | Functions | Lines
---------------------------------------------------------------------------
goalService.ts          |    95.2%   |   87.5%  |   100%    |  94.8%
progressService.ts      |    88.1%   |   75.0%  |   92.3%   |  87.6%
indexedDB.ts            |    78.9%   |   65.0%  |   80.0%   |  78.5%
```

**Goals**:
- Statements: 80%+
- Branches: 75%+
- Functions: 85%+
- Lines: 80%+

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Tests implementation detail
it('sets state to loading', () => {
  const [state, setState] = useState(false)
  setState(true)
  expect(state).toBe(true)
})

// ✅ Good - Tests user-facing behavior
it('shows loading spinner while fetching', async () => {
  render(<GoalList />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

### 2. Use Meaningful Names

```typescript
// ❌ Bad
it('works', () => { ... })

// ✅ Good
it('displays progress percentage when goal is partially complete', () => { ... })
```

### 3. Follow AAA Pattern

```typescript
it('calculates daily progress correctly', async () => {
  // Arrange: Set up test data
  const goal = { id: '1', frequency: 'daily' }
  const progress = [
    { value: 10, loggedAt: today },
    { value: 5, loggedAt: today },
  ]

  // Act: Call the function
  const total = await calculateGoalProgress(goal.id, today, today)

  // Assert: Check the result
  expect(total).toBe(15)
})
```

### 4. Test Edge Cases

```typescript
it('handles zero progress', () => {
  expect(calculatePercentage(0, 30)).toBe(0)
})

it('handles null/undefined gracefully', () => {
  expect(calculatePercentage(null, 30)).toBe(0)
})

it('handles progress > target', () => {
  expect(calculatePercentage(40, 30)).toBe(133)
})
```

## Debugging Tests

### Run Single Test

```bash
npm run test -- goalService.test.ts
```

### Debug in Browser

```bash
npm run test:ui
```

Opens interactive test browser where you can:
- See test results
- Click to run/debug
- See component states

### Add Debugging Output

```typescript
it('creates a goal', async () => {
  const result = await createGoal(userId, goalData)
  
  console.log('Created goal:', result)
  console.log('Goal ID:', result.id)
  
  expect(result.id).toBeDefined()
})
```

## External Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Related Documentation**:
- [Services Guide](./08-SERVICES.md)
- [Components Guide](./07-COMPONENTS.md)
- [Deployment](./11-DEPLOYMENT.md)
