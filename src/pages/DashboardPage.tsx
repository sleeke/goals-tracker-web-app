import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { CreateGoalModal } from '@/components/CreateGoalModal'
import { EditGoalModal } from '@/components/EditGoalModal'
import { ProgressHistoryModal } from '@/components/ProgressHistoryModal'
import { GoalCard } from '@/components/GoalCard'
import { ProgressLoggerModal } from '@/components/ProgressLoggerModal'
import {
  createGoal,
  updateGoal,
  deleteGoal,
  subscribeToUserGoals,
} from '@/services/goalService'
import { logProgress, calculateGoalProgress, subscribeToGoalProgress } from '@/services/progressService'
import type { Goal } from '@/types'
import './DashboardPage.css'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalProgress, setGoalProgress] = useState<Record<string, number>>({})
  const [yearlyProgress, setYearlyProgress] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProgressLogger, setShowProgressLogger] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Load goals on component mount
  useEffect(() => {
    if (!user?.uid) return

    const loadGoals = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Subscribe to real-time goal updates
        const unsubscribe = subscribeToUserGoals(user.uid, (loadedGoals) => {
          setGoals(loadedGoals)
          loadProgressForGoals(loadedGoals)
        })

        return unsubscribe
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load goals'
        setError(message)
        console.error('Error loading goals:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const unsubscribePromise = loadGoals()
    return () => {
      unsubscribePromise.then((unsub) => unsub?.())
    }
  }, [user?.uid])

  // Subscribe to progress updates for all goals
  useEffect(() => {
    if (!goals.length || !user?.uid) return

    const unsubscribers: Array<() => void> = []

    for (const goal of goals) {
      const unsubscribe = subscribeToGoalProgress(goal.id!, (progress) => {
        // Calculate total progress for today
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

        console.log('[Dashboard] Progress subscription update for goal', goal.id, {
          progressRecords: progress.length,
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          records: progress.map(p => ({
            value: p.value,
            loggedAt: p.loggedAt?.toISOString?.() || p.loggedAt,
            inRange: p.loggedAt >= startOfDay && p.loggedAt <= endOfDay,
            revertedBy: p.revertedBy,
          }))
        })

        const totalProgress = progress
          .filter((p) => {
            // loggedAt is now a proper JS Date thanks to subscribeToGoalProgress conversion
            return p.loggedAt >= startOfDay && p.loggedAt <= endOfDay && !p.revertedBy
          })
          .reduce((total, p) => total + (p.value || 0), 0)

        console.log('[Dashboard] Calculated total progress:', totalProgress)

        setGoalProgress((prev) => ({
          ...prev,
          [goal.id!]: totalProgress,
        }))
      })
      unsubscribers.push(unsubscribe)
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [goals, user?.uid])

  const getGoalPeriod = (goal: Goal) => {
    // calculate startDate and EndDate based on Goal frequency
    var today = new Date()
    var startDate: Date
    var endDate: Date
      if (goal.frequency === 'daily') {
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      } else if (goal.frequency === 'weekly') {
        const dayOfWeek = today.getDay() // 0 (Sun) to 6 (Sat)
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek)
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - dayOfWeek), 23, 59, 59)
      } else if (goal.frequency === 'monthly') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      } else {
        // Default to daily if frequency is unknown
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      }

      return { start: startDate, end: endDate }
  }

  const loadProgressForGoals = async (goalsToLoad: Goal[]) => {
    if (!user?.uid) return

    const progressMap: Record<string, number> = {}
    const yearlyProgressMap: Record<string, number> = {}

    const today = new Date()
    const yearStart = new Date(today.getFullYear(), 0, 1)
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59)

    for (const goal of goalsToLoad) {
      const goalPeriod = getGoalPeriod(goal)

      try {
        // Get current period progress
        const progress = await calculateGoalProgress(
          goal.id!,
          user.uid,
          goalPeriod.start,
          goalPeriod.end
        )
        progressMap[goal.id!] = progress

        // Get yearly progress
        const yearly = await calculateGoalProgress(
          goal.id!,
          user.uid,
          yearStart,
          yearEnd
        )
        yearlyProgressMap[goal.id!] = yearly
      } catch (err) {
        console.error(`Error calculating progress for goal ${goal.id}:`, err)
        progressMap[goal.id!] = 0
        yearlyProgressMap[goal.id!] = 0
      }
    }

    setGoalProgress(progressMap)
    setYearlyProgress(yearlyProgressMap)
  }

  const handleCreateGoal = async (goalData: any) => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      setError(null)
      
      await createGoal(user.uid, {
        ...goalData,
        userId: user.uid,
      })
      
      // Goal will be added via real-time subscription
      setShowCreateModal(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create goal'
      setError(message)
      console.error('Error creating goal:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await deleteGoal(goalId)
      // Goal will be removed via real-time subscription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete goal'
      setError(message)
      console.error('Error deleting goal:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditGoalClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowEditModal(true)
  }

  const handleSaveGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await updateGoal(goalId, updates)
      
      // Goal will be updated via real-time subscription
      setShowEditModal(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update goal'
      setError(message)
      console.error('Error updating goal:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewHistoryClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowHistoryModal(true)
  }

  const handleLogProgress = async (data: {
    amount: number
    notes?: string
    loggedAt: Date
    isRetroactive: boolean
  }) => {
    if (!user?.uid || !selectedGoal?.id) return

    try {
      setIsLoading(true)
      setError(null)

      await logProgress(
        selectedGoal.id,
        user.uid,
        data.amount,
        data.notes,
        data.loggedAt,
        data.isRetroactive
      )

      setShowProgressLogger(false)
      
      const goalPeriod = getGoalPeriod(selectedGoal)

      // Reload progress for the goal
      const progress = await calculateGoalProgress(
        selectedGoal.id,
        user.uid,
        goalPeriod.start,
        goalPeriod.end
      )
      
      setGoalProgress((prev) => ({
        ...prev,
        [selectedGoal.id!]: progress,
      }))
    } catch (err) {
      const error = err as any
      const message = err instanceof Error ? err.message : 'Failed to log progress'
      const fullError = `${message}${error?.code ? ` [${error.code}]` : ''}`
      
      setError(fullError)
      console.error('Error logging progress:', {
        message,
        code: error?.code,
        details: error?.message,
        fullError: err,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogProgressClick = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      setSelectedGoal(goal)
      setShowProgressLogger(true)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Goal Tracker</h1>
        <div className="user-menu">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            <div className="error-message-header">
              <strong>⚠️ Error:</strong> {error}
            </div>
            <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>
              Check browser console (F12) for more details
            </p>
          </div>
        )}

        <div className="dashboard-controls">
          <h2>Your Goals</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            + New Goal
          </button>
        </div>

        {isLoading && goals.length === 0 ? (
          <div className="loading-placeholder">
            <p>Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <p>📌 No goals yet!</p>
            <p>Create your first goal to get started.</p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={goalProgress[goal.id!] || 0}
                progressTarget={goal.targetValue}
                yearlyProgress={yearlyProgress[goal.id!] || 0}
                onLogProgress={handleLogProgressClick}
                onEdit={handleEditGoalClick}
                onViewHistory={handleViewHistoryClick}
                onDelete={handleDeleteGoal}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </main>

      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateGoal}
        isLoading={isLoading}
      />

      <EditGoalModal
        isOpen={showEditModal}
        goal={selectedGoal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveGoal}
        isLoading={isLoading}
      />

      <ProgressHistoryModal
        isOpen={showHistoryModal}
        goal={selectedGoal}
        onClose={() => setShowHistoryModal(false)}
        isLoading={isLoading}
      />

      <ProgressLoggerModal
        isOpen={showProgressLogger}
        goal={selectedGoal}
        onClose={() => setShowProgressLogger(false)}
        onSubmit={handleLogProgress}
        isLoading={isLoading}
      />
    </div>
  )
}
