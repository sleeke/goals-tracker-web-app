import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest'
import {
  getReminderSettings,
  saveReminderSettings,
  msUntilNextReminder,
  countRemainingGoals,
  showReminderNotification,
  getNotificationPermission,
  DEFAULT_REMINDER_TIME,
} from '../notificationService'

// localStorage is mocked globally in src/test/setup.ts
const localStorageMock = window.localStorage as unknown as {
  getItem: MockInstance
  setItem: MockInstance
  removeItem: MockInstance
  clear: MockInstance
}

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // getReminderSettings
  // ---------------------------------------------------------------------------

  describe('getReminderSettings', () => {
    it('returns defaults when localStorage has no entry', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const settings = getReminderSettings()
      expect(settings.enabled).toBe(false)
      expect(settings.time).toBe(DEFAULT_REMINDER_TIME)
    })

    it('returns parsed settings when a valid entry exists', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ enabled: true, time: '18:30' })
      )
      const settings = getReminderSettings()
      expect(settings.enabled).toBe(true)
      expect(settings.time).toBe('18:30')
    })

    it('falls back to defaults when JSON is malformed', () => {
      localStorageMock.getItem.mockReturnValue('not-valid-json{{{')
      const settings = getReminderSettings()
      expect(settings.enabled).toBe(false)
      expect(settings.time).toBe(DEFAULT_REMINDER_TIME)
    })

    it('falls back to default time when stored time format is invalid', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ enabled: true, time: 'bad-time' })
      )
      const settings = getReminderSettings()
      expect(settings.time).toBe(DEFAULT_REMINDER_TIME)
    })
  })

  // ---------------------------------------------------------------------------
  // saveReminderSettings
  // ---------------------------------------------------------------------------

  describe('saveReminderSettings', () => {
    it('serialises settings to localStorage', () => {
      saveReminderSettings({ enabled: true, time: '20:00' })
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'goal-tracker-reminder-settings',
        JSON.stringify({ enabled: true, time: '20:00' })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // msUntilNextReminder
  // ---------------------------------------------------------------------------

  describe('msUntilNextReminder', () => {
    it('returns -1 for an invalid time string', () => {
      expect(msUntilNextReminder('not-a-time')).toBe(-1)
      expect(msUntilNextReminder('25:00')).toBe(-1)
      expect(msUntilNextReminder('12:99')).toBe(-1)
    })

    it('returns a positive number of ms for a future time today', () => {
      // Fix "now" to 08:00
      const now = new Date()
      now.setHours(8, 0, 0, 0)
      vi.setSystemTime(now)

      const ms = msUntilNextReminder('09:00')
      expect(ms).toBe(60 * 60 * 1000) // exactly 1 hour
    })

    it('rolls over to tomorrow when the time has already passed today', () => {
      // Fix "now" to 10:00
      const now = new Date()
      now.setHours(10, 0, 0, 0)
      vi.setSystemTime(now)

      const ms = msUntilNextReminder('09:00')
      // Should be 23 hours away
      expect(ms).toBe(23 * 60 * 60 * 1000)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    beforeEach(() => {
      vi.useFakeTimers()
    })
  })

  // ---------------------------------------------------------------------------
  // countRemainingGoals
  // ---------------------------------------------------------------------------

  describe('countRemainingGoals', () => {
    const goals = [
      { id: 'g1', targetValue: 5 },
      { id: 'g2', targetValue: 3 },
      { id: 'g3', targetValue: 10 },
    ]

    it('counts goals where progress is below target', () => {
      const progress = { g1: 5, g2: 2, g3: 0 }
      expect(countRemainingGoals(goals, progress)).toBe(2)
    })

    it('returns 0 when all goals are at or above target', () => {
      const progress = { g1: 5, g2: 3, g3: 10 }
      expect(countRemainingGoals(goals, progress)).toBe(0)
    })

    it('treats missing progress entries as 0', () => {
      expect(countRemainingGoals(goals, {})).toBe(3)
    })

    it('returns 0 for an empty goals list', () => {
      expect(countRemainingGoals([], { g1: 5 })).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // showReminderNotification
  // ---------------------------------------------------------------------------

  describe('showReminderNotification', () => {
    it('does nothing when Notification API is unsupported', () => {
      const original = (window as unknown as Record<string, unknown>).Notification
      delete (window as unknown as Record<string, unknown>).Notification

      // Should not throw
      expect(() => showReminderNotification(3)).not.toThrow()

      ;(window as unknown as Record<string, unknown>).Notification = original
    })

    it('does nothing when permission is not granted', () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, 'permission', { value: 'default', configurable: true })
      ;(window as unknown as Record<string, unknown>).Notification = NotificationSpy

      showReminderNotification(2)
      expect(NotificationSpy).not.toHaveBeenCalled()
    })

    it('fires a Notification when permission is granted', () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, 'permission', { value: 'granted', configurable: true })
      ;(window as unknown as Record<string, unknown>).Notification = NotificationSpy

      showReminderNotification(2)
      expect(NotificationSpy).toHaveBeenCalledOnce()
      const [title, opts] = NotificationSpy.mock.calls[0] as [string, NotificationOptions]
      expect(title).toBe('Goal Tracker Reminder')
      expect(opts.body).toContain('2 goals remaining')
    })

    it('uses a congratulatory message when remainingCount is 0', () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, 'permission', { value: 'granted', configurable: true })
      ;(window as unknown as Record<string, unknown>).Notification = NotificationSpy

      showReminderNotification(0)
      const [, opts] = NotificationSpy.mock.calls[0] as [string, NotificationOptions]
      expect(opts.body).toContain("completed all your goals")
    })
  })

  // ---------------------------------------------------------------------------
  // getNotificationPermission
  // ---------------------------------------------------------------------------

  describe('getNotificationPermission', () => {
    it('returns "denied" when Notification API is unsupported', () => {
      const original = (window as unknown as Record<string, unknown>).Notification
      delete (window as unknown as Record<string, unknown>).Notification
      expect(getNotificationPermission()).toBe('denied')
      ;(window as unknown as Record<string, unknown>).Notification = original
    })
  })
})
