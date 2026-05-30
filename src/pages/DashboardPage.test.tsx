import { act, render, fireEvent } from '@/test/test-utils'
import { describe, it, expect, vi, afterEach, beforeEach, type Mock } from 'vitest'
import { DashboardPage } from '@/pages/DashboardPage'
import type { Goal, Progress } from '@/types'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-1', email: 'test@example.com' }, logout: vi.fn() }),
}))

vi.mock('@/components/ProfileMenu', () => ({
  ProfileMenu: () => null,
}))

vi.mock('@/services/goalService', () => ({
  subscribeToUserGoals: vi.fn(),
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
}))

vi.mock('@/services/progressService', () => ({
  subscribeToGoalProgress: vi.fn(),
  logProgress: vi.fn(),
  calculateGoalProgress: vi.fn(),
}))

import { subscribeToUserGoals, updateGoal, createGoal } from '@/services/goalService'
import { subscribeToGoalProgress, calculateGoalProgress } from '@/services/progressService'

const baseWeeklyGoal: Goal = {
  id: 'goal-weekly',
  userId: 'user-1',
  title: 'Weekly Exercise',
  category: 'health',
  frequency: 'weekly',
  targetValue: 3,
  unit: 'sessions',
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
  status: 'active',
  priority: 'medium',
  color: '#667eea',
}

describe('DashboardPage – loading state flicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(updateGoal as Mock).mockResolvedValue(undefined)
    ;(calculateGoalProgress as Mock).mockResolvedValue(0)
    // subscribeToUserGoals captures the callback but does NOT invoke it —
    // simulates network latency before the first Firestore snapshot arrives.
    ;(subscribeToUserGoals as Mock).mockImplementation((_uid: string, _cb: unknown) => () => {})
    ;(subscribeToGoalProgress as Mock).mockReturnValue(() => {})
  })

  it('shows the loading placeholder — not the empty state — while waiting for the first goals snapshot', () => {
    const { queryByText } = render(<DashboardPage />)

    // The subscription has not yet delivered any data.
    // With the bug, isLoading is reset to false in the `finally` block before
    // any goals arrive, so the "No goals yet" empty state briefly flashes.
    expect(queryByText(/no goals yet/i)).not.toBeInTheDocument()
  })
})

describe('DashboardPage – goal auto-complete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(updateGoal as Mock).mockResolvedValue(undefined)
    ;(calculateGoalProgress as Mock).mockResolvedValue(0)
    ;(subscribeToUserGoals as Mock).mockReturnValue(() => {})
    ;(subscribeToGoalProgress as Mock).mockReturnValue(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the full goal period — not just today — when computing progress from the real-time subscription', async () => {
    // Pin the date to Wednesday 2026-05-27.
    // The current week (Sun–Sat) runs May 24 – May 30.
    vi.useFakeTimers({ now: new Date('2026-05-27T12:00:00') })

    const makeProgress = (id: string, loggedAt: Date): Progress => ({
      id,
      goalId: 'goal-weekly',
      value: 1,
      loggedAt,
      timestamp: loggedAt,
      note: '',
      isRetroactive: false,
      metadata: { deviceId: 'test', syncStatus: 'synced' },
    })

    // Three logs spread across the current week: Mon, Tue, and today (Wed).
    // Weekly total  = 3 = targetValue  → goal should auto-complete and stay completed.
    // Today's total = 1 < targetValue  → goal must NOT auto-reopen.
    // The bug: the subscription callback only counted today's logs, making
    // progress appear to drop to 1 after auto-complete, triggering auto-reopen.
    const weeklyProgressRecords = [
      makeProgress('p1', new Date('2026-05-25T10:00:00')), // Monday
      makeProgress('p2', new Date('2026-05-26T10:00:00')), // Tuesday
      makeProgress('p3', new Date('2026-05-27T10:00:00')), // Today (Wednesday)
    ]

    let goalsCallback: ((goals: Goal[]) => void) | undefined
    ;(subscribeToUserGoals as Mock).mockImplementation((_uid, cb) => {
      goalsCallback = cb
      return () => {}
    })

    // Capture the latest progress callback (re-assigned each time subscribeToGoalProgress is called)
    let latestProgressCallback: ((progress: Progress[]) => void) | undefined
    ;(subscribeToGoalProgress as Mock).mockImplementation((_goalId, cb) => {
      latestProgressCallback = cb
      return () => {}
    })

    // loadProgressForGoals calls calculateGoalProgress for the full period → returns 3
    ;(calculateGoalProgress as Mock).mockResolvedValue(3)

    render(<DashboardPage />)

    // Deliver initial goals, which triggers loadProgressForGoals (period total = 3)
    // and subsequently the auto-complete effect (3 ≥ targetValue 3).
    await act(async () => {
      goalsCallback!([baseWeeklyGoal])
    })

    // Confirm the goal was auto-completed before testing the regression.
    // (act already flushed all microtasks and effects from the goals delivery above.)
    expect(updateGoal).toHaveBeenCalledWith(
      'goal-weekly',
      expect.objectContaining({ status: 'completed' }),
    )

    // After auto-complete, subscribeToGoalProgress re-subscribes (because goals changed).
    // Simulate Firestore delivering the three weekly progress records to the new subscription.
    await act(async () => {
      latestProgressCallback!(weeklyProgressRecords)
    })

    // REGRESSION: with the bug the callback only counted today's 1 log, so progress
    // appeared to drop below the target, triggering an auto-reopen that oscillated
    // with auto-complete indefinitely.
    // With the fix the callback counts all 3 weekly logs (= target), so the goal
    // stays completed and updateGoal is never called with status 'active'.
    expect(updateGoal).not.toHaveBeenCalledWith(
      'goal-weekly',
      expect.objectContaining({ status: 'active' }),
    )
  })
})

// ── CRUD operation flicker ────────────────────────────────────────────────────
//
// Root cause: handleCreateGoal (and the other CRUD handlers) call
// setIsLoading(false) in a `finally` block.  When a user creates their very
// first goal the sequence is:
//
//   1. setIsLoading(true)           → isLoading=true,  goals=[]  → loading placeholder ✓
//   2. await createGoal(...)        → write succeeds
//   3. finally: setIsLoading(false) → isLoading=false, goals=[]  → "No goals yet" ← BUG
//   4. subscription fires           → isLoading=false, goals=[…] → goals shown ✓
//
// The fix: remove setIsLoading(false) from the finally block (success path).
// isLoading stays true until the subscription delivers the new goal.
// Errors still call setIsLoading(false) from the catch block.

describe('DashboardPage – first-goal creation flicker', () => {
  let capturedGoalsCallback: ((goals: Goal[]) => void) | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    ;(updateGoal as Mock).mockResolvedValue(undefined)
    ;(calculateGoalProgress as Mock).mockResolvedValue(0)
    ;(subscribeToGoalProgress as Mock).mockReturnValue(() => {})
    // Subscription captures the callback. Fired once with [] to reach the
    // "no goals yet" initial state. NOT fired again after the write — simulates
    // Firestore latency between the write completing and the snapshot arriving.
    ;(subscribeToUserGoals as Mock).mockImplementation((_uid, cb) => {
      capturedGoalsCallback = cb
      return () => {}
    })
    // createGoal resolves immediately (write succeeded; snapshot not yet delivered)
    ;(createGoal as Mock).mockResolvedValue({ id: 'goal-new', title: 'My First Goal' })
  })

  it('does not flash "No goals yet" after createGoal resolves but before the subscription fires', async () => {
    const { queryByText, getByRole, getByLabelText } = render(<DashboardPage />)

    // 1. Fire subscription with empty goals → isLoading=false, goals=[]
    //    This enables the "New Goal" button and shows the empty state.
    await act(async () => {
      capturedGoalsCallback!([])
    })
    expect(queryByText(/no goals yet/i)).toBeInTheDocument()

    // 2. Open the Create Goal modal
    await act(async () => {
      fireEvent.click(getByRole('button', { name: /new goal/i }))
    })

    // 3. Fill in the required title field
    await act(async () => {
      fireEvent.change(getByLabelText('Goal Title *'), {
        target: { value: 'My First Goal' },
      })
    })

    // 4. Submit the form. createGoal resolves immediately in the mock.
    //    handleCreateGoal: setIsLoading(true) → await createGoal → finally: setIsLoading(false)
    //    On BUGGY code:  isLoading=false, goals=[] → "No goals yet" flashes back.
    //    On FIXED code:  isLoading stays true until subscription fires → loading placeholder.
    await act(async () => {
      fireEvent.click(getByRole('button', { name: /create goal/i }))
    })

    // REGRESSION ASSERTION: the empty-state must NOT appear during the create operation.
    // On buggy code this FAILS because finally: setIsLoading(false) fires before
    // the Firestore subscription delivers the new goal.
    expect(queryByText(/no goals yet/i)).not.toBeInTheDocument()
  })
})
