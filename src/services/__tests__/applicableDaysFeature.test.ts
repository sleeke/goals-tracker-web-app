import { describe, it, expect } from 'vitest'

/**
 * Unit tests for the applicableDays / day-selector feature.
 *
 * Covers:
 * - isGoalApplicableToday logic (extracted from DashboardPage)
 * - Goal filtering into active vs completed/inactive sections
 * - DaySelector toggle logic
 */

// ---------------------------------------------------------------------------
// Helper – mirrors DashboardPage.isGoalApplicableToday
// ---------------------------------------------------------------------------
interface GoalWithDays {
  id: string
  status: 'active' | 'archived' | 'completed'
  title: string
  applicableDays?: number[]
  completedDate?: Date
}

function isGoalApplicableToday(goal: GoalWithDays, todayDayIndex: number): boolean {
  if (!goal.applicableDays || goal.applicableDays.length === 0) return true
  return goal.applicableDays.includes(todayDayIndex)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('applicableDays feature', () => {
  describe('isGoalApplicableToday', () => {
    it('returns true when applicableDays is undefined', () => {
      const goal: GoalWithDays = { id: '1', status: 'active', title: 'Test' }
      expect(isGoalApplicableToday(goal, 1)).toBe(true)
    })

    it('returns true when applicableDays is an empty array', () => {
      const goal: GoalWithDays = { id: '1', status: 'active', title: 'Test', applicableDays: [] }
      expect(isGoalApplicableToday(goal, 3)).toBe(true)
    })

    it('returns true when today is in applicableDays', () => {
      const goal: GoalWithDays = {
        id: '1',
        status: 'active',
        title: 'Test',
        applicableDays: [1, 3, 5], // Mon, Wed, Fri
      }
      expect(isGoalApplicableToday(goal, 1)).toBe(true) // Monday
      expect(isGoalApplicableToday(goal, 3)).toBe(true) // Wednesday
      expect(isGoalApplicableToday(goal, 5)).toBe(true) // Friday
    })

    it('returns false when today is NOT in applicableDays', () => {
      const goal: GoalWithDays = {
        id: '1',
        status: 'active',
        title: 'Test',
        applicableDays: [1, 3, 5], // Mon, Wed, Fri
      }
      expect(isGoalApplicableToday(goal, 0)).toBe(false) // Sunday
      expect(isGoalApplicableToday(goal, 2)).toBe(false) // Tuesday
      expect(isGoalApplicableToday(goal, 4)).toBe(false) // Thursday
      expect(isGoalApplicableToday(goal, 6)).toBe(false) // Saturday
    })

    it('handles single-day selection', () => {
      const goal: GoalWithDays = {
        id: '1',
        status: 'active',
        title: 'Test',
        applicableDays: [0], // Sunday only
      }
      expect(isGoalApplicableToday(goal, 0)).toBe(true)
      expect(isGoalApplicableToday(goal, 1)).toBe(false)
    })

    it('handles all-days selection', () => {
      const goal: GoalWithDays = {
        id: '1',
        status: 'active',
        title: 'Test',
        applicableDays: [0, 1, 2, 3, 4, 5, 6],
      }
      for (let day = 0; day <= 6; day++) {
        expect(isGoalApplicableToday(goal, day)).toBe(true)
      }
    })
  })

  describe('Goal filtering with applicableDays', () => {
    const MONDAY = 1
    const SUNDAY = 0

    const goals: GoalWithDays[] = [
      { id: '1', status: 'active', title: 'Weekday goal', applicableDays: [1, 2, 3, 4, 5] },
      { id: '2', status: 'active', title: 'Weekend goal', applicableDays: [0, 6] },
      { id: '3', status: 'active', title: 'All days goal', applicableDays: [] },
      { id: '4', status: 'active', title: 'No days set', /* no applicableDays */ },
      { id: '5', status: 'completed', title: 'Already completed' },
    ]

    it('shows weekday goals as active on Monday', () => {
      const active = goals.filter(
        (g) => g.status === 'active' && isGoalApplicableToday(g, MONDAY)
      )
      const titles = active.map((g) => g.title)

      expect(titles).toContain('Weekday goal')
      expect(titles).toContain('All days goal')
      expect(titles).toContain('No days set')
      expect(titles).not.toContain('Weekend goal')
    })

    it('moves weekend-only goals to inactive section on Monday', () => {
      const inactive = goals.filter(
        (g) => g.status === 'completed' || (g.status === 'active' && !isGoalApplicableToday(g, MONDAY))
      )
      const titles = inactive.map((g) => g.title)

      expect(titles).toContain('Weekend goal')
      expect(titles).toContain('Already completed')
      expect(titles).not.toContain('Weekday goal')
    })

    it('shows weekend goals as active on Sunday', () => {
      const active = goals.filter(
        (g) => g.status === 'active' && isGoalApplicableToday(g, SUNDAY)
      )
      const titles = active.map((g) => g.title)

      expect(titles).toContain('Weekend goal')
      expect(titles).not.toContain('Weekday goal')
    })

    it('active goals with no applicableDays set always appear in active section', () => {
      for (let day = 0; day <= 6; day++) {
        const active = goals.filter(
          (g) => g.status === 'active' && isGoalApplicableToday(g, day)
        )
        expect(active.some((g) => g.id === '3')).toBe(true) // empty array
        expect(active.some((g) => g.id === '4')).toBe(true) // undefined
      }
    })
  })

  describe('DaySelector toggle logic', () => {
    function toggle(current: number[], day: number): number[] {
      if (current.includes(day)) {
        return current.filter((d) => d !== day)
      }
      return [...current, day].sort((a, b) => a - b)
    }

    it('adds a day when it is not currently selected', () => {
      expect(toggle([], 1)).toEqual([1])
      expect(toggle([1, 3], 5)).toEqual([1, 3, 5])
    })

    it('removes a day when it is already selected', () => {
      expect(toggle([1], 1)).toEqual([])
      expect(toggle([1, 3, 5], 3)).toEqual([1, 5])
    })

    it('keeps the result sorted by day index', () => {
      expect(toggle([3, 5], 1)).toEqual([1, 3, 5])
      expect(toggle([1, 5], 3)).toEqual([1, 3, 5])
    })

    it('can select all days individually', () => {
      let days: number[] = []
      for (let day = 6; day >= 0; day--) {
        days = toggle(days, day)
      }
      expect(days).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    it('can deselect all days individually', () => {
      let days: number[] = [0, 1, 2, 3, 4, 5, 6]
      for (let day = 0; day <= 6; day++) {
        days = toggle(days, day)
      }
      expect(days).toEqual([])
    })
  })
})
