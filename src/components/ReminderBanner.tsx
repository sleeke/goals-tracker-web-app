import './ReminderBanner.css'

interface ReminderBannerProps {
  remainingCount: number
  onDismiss: () => void
}

export function ReminderBanner({ remainingCount, onDismiss }: ReminderBannerProps) {
  const message =
    remainingCount === 0
      ? "Great work! You've completed all your goals for today."
      : remainingCount === 1
      ? 'Daily reminder: You have 1 goal remaining today.'
      : `Daily reminder: You have ${remainingCount} goals remaining today.`

  return (
    <div className="reminder-banner" role="alert" aria-live="polite">
      <span className="material-icons-outlined reminder-banner-icon">notifications</span>
      <span className="reminder-banner-message">{message}</span>
      <button
        className="reminder-banner-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss reminder"
      >
        <span className="material-icons-outlined">close</span>
      </button>
    </div>
  )
}
