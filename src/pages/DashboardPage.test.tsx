import { act, render } from '@/test/test-utils'
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

import { subscribeToUserGoals, updateGoal } from '@/services/goalService'
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
