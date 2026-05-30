const REMINDER_SETTINGS_KEY = 'goal-tracker-reminder-settings'
export const DEFAULT_REMINDER_TIME = '09:00'

export interface ReminderSettings {
  enabled: boolean
  time: string // "HH:mm" 24-hour format
}

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_SETTINGS_KEY)
    if (!raw) return { enabled: false, time: DEFAULT_REMINDER_TIME }
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
      time: typeof parsed.time === 'string' && /^\d{2}:\d{2}$/.test(parsed.time)
        ? parsed.time
        : DEFAULT_REMINDER_TIME,
    }
  } catch {
    return { enabled: false, time: DEFAULT_REMINDER_TIME }
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings))
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

export function showReminderNotification(remainingCount: number): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const body =
    remainingCount === 0
      ? "You've completed all your goals for today! Well done! 🎉"
      : remainingCount === 1
      ? 'You have 1 goal remaining today. Keep going!'
      : `You have ${remainingCount} goals remaining today. Keep going!`

  new Notification('Goal Tracker Reminder', {
    body,
    icon: '/img/icon-192x192.png',
    badge: '/img/icon-192x192.png',
    tag: 'daily-reminder', // replaces any previous un-dismissed reminder
  })
}

/**
 * Returns milliseconds until the next occurrence of the given HH:mm time.
 * If the time has already passed today, returns ms until tomorrow at that time.
 * Returns -1 if timeStr is invalid.
 */
export function msUntilNextReminder(timeStr: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr)
  if (!match) return -1

  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1

  const now = new Date()
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  )

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  return next.getTime() - now.getTime()
}

/**
 * Count goals that have not yet reached their target value for today.
 */
export function countRemainingGoals(
  goals: Array<{ id: string; targetValue: number }>,
  goalProgress: Record<string, number>
): number {
  return goals.filter((goal) => (goalProgress[goal.id] ?? 0) < goal.targetValue).length
}
