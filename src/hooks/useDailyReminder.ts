import { useEffect, useRef, useCallback, useState } from 'react'
import type { Goal } from '@/types'
import {
  getReminderSettings,
  msUntilNextReminder,
  showReminderNotification,
  countRemainingGoals,
} from '@/services/notificationService'

export interface DailyReminderState {
  showBanner: boolean
  remainingCount: number
  dismissBanner: () => void
  reschedule: () => void
}

export function useDailyReminder(
  goals: Goal[],
  goalProgress: Record<string, number>
): DailyReminderState {
  const [showBanner, setShowBanner] = useState(false)
  const [remainingCount, setRemainingCount] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs in sync with latest props so the timeout closure always reads
  // the freshest goal/progress data without needing to reschedule.
  const goalsRef = useRef(goals)
  const progressRef = useRef(goalProgress)
  useEffect(() => {
    goalsRef.current = goals
    progressRef.current = goalProgress
  })

  const dismissBanner = useCallback(() => setShowBanner(false), [])

  // scheduleRef lets the public `reschedule` callback (and the timer itself)
  // trigger scheduling without the function being a useCallback dependency.
  const scheduleRef = useRef<(() => void) | null>(null)

  // The core scheduling logic lives inside this effect so `schedule` can call
  // itself recursively without triggering react-hooks/immutability or
  // react-hooks/refs lint rules.
  useEffect(() => {
    const schedule = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const settings = getReminderSettings()
      if (!settings.enabled) return

      const ms = msUntilNextReminder(settings.time)
      if (ms < 0) return

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        const remaining = countRemainingGoals(goalsRef.current, progressRef.current)
        setRemainingCount(remaining)
        showReminderNotification(remaining)
        setShowBanner(true)
        // Re-schedule for the same time next day
        schedule()
      }, ms)
    }

    scheduleRef.current = schedule
    schedule()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'goal-tracker-reminder-settings') {
        schedule()
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('storage', handleStorage)
      scheduleRef.current = null
    }
  }, []) // empty deps – stable, only runs on mount/unmount

  // Exposed so callers (e.g. ProfileMenu after settings change) can re-arm
  // the timer without unmounting the hook.
  const reschedule = useCallback(() => {
    scheduleRef.current?.()
  }, [])

  return { showBanner, remainingCount, dismissBanner, reschedule }
}
