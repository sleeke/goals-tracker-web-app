import { describe, it, expect } from 'vitest'

/**
 * Unit tests for completed goals feature
 * These tests verify the logic without needing a running server
 */
describe('Completed Goals Feature Logic', () => {
  describe('Goal filtering and sorting', () => {
    interface Goal {
      id: string
      status: 'active' | 'archived' | 'completed'
      title: string
      completedDate?: Date
    }

    const mockGoals: Goal[] = [
      {
        id: '1',
        status: 'active',
        title: 'Active Goal 1',
      },
      {
        id: '2',
        status: 'active',
        title: 'Active Goal 2',
      },
      {
        id: '3',
        status: 'completed',
        title: 'Completed Goal 1',
        completedDate: new Date('2026-01-10'),
      },
      {
        id: '4',
        status: 'completed',
        title: 'Completed Goal 2',
        completedDate: new Date('2026-01-14'),
      },
      {
        id: '5',
        status: 'archived',
        title: 'Archived Goal',
      },
    ]

    it('should separate goals into active and completed arrays', () => {
      const activeGoals = mockGoals.filter((g) => g.status === 'active')
      const completedGoals = mockGoals.filter((g) => g.status === 'completed')

      expect(activeGoals).toHaveLength(2)
      expect(completedGoals).toHaveLength(2)
      expect(completedGoals.every((g) => g.status === 'completed')).toBe(true)
    })

    it('should sort completed goals by completedDate descending (most recent first)', () => {
      const completedGoals = mockGoals
        .filter((g) => g.status === 'completed')
        .sort((a, b) => {
          const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0
          const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0
          return dateB - dateA
        })

      expect(completedGoals[0].title).toBe('Completed Goal 2')
      expect(completedGoals[1].title).toBe('Completed Goal 1')
    })

    it('should only show completed goals section when completed goals exist', () => {
      const completedGoals = mockGoals.filter((g) => g.status === 'completed')
      const shouldShowSection = completedGoals.length > 0

      expect(shouldShowSection).toBe(true)
    })

    it('should not show completed goals section when no completed goals exist', () => {
      const goalsWithNoCompleted: Goal[] = mockGoals.filter((g) => g.status !== 'completed')
      const completedGoals = goalsWithNoCompleted.filter((g) => g.status === 'completed')
      const shouldShowSection = completedGoals.length > 0

      expect(shouldShowSection).toBe(false)
    })
  })

  describe('Collapsed/Expanded state management', () => {
    it('should initialize expandedCompletedGoals as empty set', () => {
      const expandedCompletedGoals = new Set<string>()
      expect(expandedCompletedGoals.size).toBe(0)
    })

    it('should add goal ID when expanding', () => {
      const expandedCompletedGoals = new Set<string>()
      const goalId = 'goal-123'

      expandedCompletedGoals.add(goalId)

      expect(expandedCompletedGoals.has(goalId)).toBe(true)
      expect(expandedCompletedGoals.size).toBe(1)
    })

    it('should remove goal ID when collapsing', () => {
      const expandedCompletedGoals = new Set<string>(['goal-123', 'goal-456'])

      expandedCompletedGoals.delete('goal-123')

      expect(expandedCompletedGoals.has('goal-123')).toBe(false)
      expect(expandedCompletedGoals.size).toBe(1)
      expect(expandedCompletedGoals.has('goal-456')).toBe(true)
    })

    it('should toggle goal expansion state', () => {
      const expandedCompletedGoals = new Set<string>(['goal-123'])
      const goalId = 'goal-456'

      // Expand
      if (!expandedCompletedGoals.has(goalId)) {
        expandedCompletedGoals.add(goalId)
      }
      expect(expandedCompletedGoals.has(goalId)).toBe(true)

      // Collapse
      expandedCompletedGoals.delete(goalId)
      expect(expandedCompletedGoals.has(goalId)).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('should convert boolean section visibility to string for storage', () => {
      const showCompletedGoalsSection = true
      const serialized = String(showCompletedGoalsSection)

      expect(serialized).toBe('true')
    })

    it('should convert stored string back to boolean for section visibility', () => {
      const stored: string = 'false'
      const showCompletedGoalsSection = stored === 'true'

      expect(showCompletedGoalsSection).toBe(false)
    })

    it('should convert "true" string to boolean correctly', () => {
      const stored: string = 'true'
      const showCompletedGoalsSection = stored === 'true'

      expect(showCompletedGoalsSection).toBe(true)
    })

    it('should serialize expanded goals set as comma-separated string', () => {
      const expandedCompletedGoals = new Set<string>(['goal-1', 'goal-2', 'goal-3'])
      const serialized = Array.from(expandedCompletedGoals).join(',')

      expect(serialized).toBe('goal-1,goal-2,goal-3')
    })

    it('should deserialize comma-separated string to goals set', () => {
      const saved: string = 'goal-1,goal-2'
      const expandedCompletedGoals = new Set(saved ? saved.split(',').filter(Boolean) : [])

      expect(expandedCompletedGoals.has('goal-1')).toBe(true)
      expect(expandedCompletedGoals.has('goal-2')).toBe(true)
      expect(expandedCompletedGoals.size).toBe(2)
    })

    it('should handle empty expanded goals string', () => {
      const saved: string = ''
      const expandedCompletedGoals = new Set(saved ? saved.split(',').filter(Boolean) : [])

      expect(expandedCompletedGoals.size).toBe(0)
    })
  })

  describe('Goal status and completion date handling', () => {
    it('should set completedDate when marking goal as completed', () => {
      const now = new Date()
      const updates = {
        status: 'completed' as const,
        completedDate: now,
      }

      expect(updates.status).toBe('completed')
      expect(updates.completedDate).toEqual(now)
    })

    it('should clear completedDate when reopening completed goal', () => {
      const updates = {
        status: 'active' as const,
        completedDate: undefined,
      }

      expect(updates.status).toBe('active')
      expect(updates.completedDate).toBeUndefined()
    })

    it('should format completion date correctly for display', () => {
      // Use UTC to avoid timezone issues in tests
      const completedDate = new Date('2026-01-14T00:00:00Z')
      const formatted = completedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      expect(formatted).toContain('Jan')
      expect(formatted).toContain('2026')
      // Just verify month and year since day might be affected by timezone
    })
  })

  describe('Collapsed vs expanded card display', () => {
    it('should determine if card is collapsed based on expanded set', () => {
      const expandedCompletedGoals = new Set<string>(['goal-1', 'goal-3'])
      const goalId = 'goal-2'

      const isCollapsed = !expandedCompletedGoals.has(goalId)

      expect(isCollapsed).toBe(true)
    })

    it('should determine if card is expanded based on expanded set', () => {
      const expandedCompletedGoals = new Set<string>(['goal-1', 'goal-3'])
      const goalId = 'goal-1'

      const isExpanded = expandedCompletedGoals.has(goalId)

      expect(isExpanded).toBe(true)
    })

    it('should show appropriate button based on status', () => {
      const activeGoalButton = 'Log Progress'
      const completedGoalButton = 'Reopen Goal'

      const status = 'completed'
      const buttonText = status === 'completed' ? completedGoalButton : activeGoalButton

      expect(buttonText).toBe('Reopen Goal')
    })
  })

  describe('Recurring goal auto-completion logic', () => {
    interface RecurringGoal {
      id: string
      status: 'active' | 'archived' | 'completed'
      targetValue: number
      completedDate?: Date
    }

    /**
     * Simulates the DashboardPage useEffect logic for determining what update
     * should be applied to a goal based on current progress.
     */
    function computeGoalUpdate(
      goal: RecurringGoal,
      currentProgress: number
    ): Partial<RecurringGoal> | null {
      if (goal.status === 'active' && currentProgress >= goal.targetValue) {
        return { status: 'completed', completedDate: new Date() }
      } else if (goal.status === 'completed' && currentProgress < goal.targetValue) {
        return { status: 'active', completedDate: undefined }
      }
      return null
    }

    it('should auto-complete an active goal when progress reaches target', () => {
      const goal: RecurringGoal = { id: '1', status: 'active', targetValue: 10 }
      const update = computeGoalUpdate(goal, 10)

      expect(update).not.toBeNull()
      expect(update!.status).toBe('completed')
      expect(update!.completedDate).toBeInstanceOf(Date)
    })

    it('should auto-complete an active goal when progress exceeds target', () => {
      const goal: RecurringGoal = { id: '1', status: 'active', targetValue: 10 }
      const update = computeGoalUpdate(goal, 15)

      expect(update).not.toBeNull()
      expect(update!.status).toBe('completed')
    })

    it('should not change an active goal when progress is below target', () => {
      const goal: RecurringGoal = { id: '1', status: 'active', targetValue: 10 }
      const update = computeGoalUpdate(goal, 5)

      expect(update).toBeNull()
    })

    it('should auto-reopen a completed goal when progress drops below target', () => {
      const goal: RecurringGoal = {
        id: '1',
        status: 'completed',
        targetValue: 10,
        completedDate: new Date('2026-01-01'),
      }
      const update = computeGoalUpdate(goal, 0)

      expect(update).not.toBeNull()
      expect(update!.status).toBe('active')
      expect(update!.completedDate).toBeUndefined()
    })

    it('should auto-reopen a completed goal when progress is partially reset', () => {
      const goal: RecurringGoal = {
        id: '1',
        status: 'completed',
        targetValue: 10,
        completedDate: new Date('2026-01-01'),
      }
      const update = computeGoalUpdate(goal, 9)

      expect(update).not.toBeNull()
      expect(update!.status).toBe('active')
      expect(update!.completedDate).toBeUndefined()
    })

    it('should not change a completed goal when progress still meets target', () => {
      const goal: RecurringGoal = {
        id: '1',
        status: 'completed',
        targetValue: 10,
        completedDate: new Date('2026-01-01'),
      }
      const update = computeGoalUpdate(goal, 10)

      expect(update).toBeNull()
    })

    it('should not affect archived goals', () => {
      const archivedGoal: RecurringGoal = { id: '1', status: 'archived', targetValue: 10 }

      const updateBelowTarget = computeGoalUpdate(archivedGoal, 0)
      const updateAtTarget = computeGoalUpdate(archivedGoal, 10)

      expect(updateBelowTarget).toBeNull()
      expect(updateAtTarget).toBeNull()
    })

    it('should treat a goal as recurring: completing then resetting then completing again', () => {
      let goal: RecurringGoal = { id: '1', status: 'active', targetValue: 5 }

      // First completion
      const completeUpdate = computeGoalUpdate(goal, 5)
      expect(completeUpdate!.status).toBe('completed')
      goal = { ...goal, ...completeUpdate! }

      // Progress reset (e.g. new period begins)
      const resetUpdate = computeGoalUpdate(goal, 0)
      expect(resetUpdate!.status).toBe('active')
      expect(resetUpdate!.completedDate).toBeUndefined()
      goal = { ...goal, ...resetUpdate! }

      // Re-completed in new period
      const recompleteUpdate = computeGoalUpdate(goal, 7)
      expect(recompleteUpdate!.status).toBe('completed')
    })
  })
})
