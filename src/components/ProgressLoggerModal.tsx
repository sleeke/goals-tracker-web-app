import { useState } from 'react'
import type { Goal } from '@/types'
import './ProgressLogger.css'
import { getTodayString } from '@/utils'

/**
 * Props for the {@link ProgressLoggerModal} component.
 *
 * @property isOpen     - Controls modal visibility.
 * @property goal       - The goal for which progress is being logged, or `null`.
 * @property onClose    - Called when the modal should close.
 * @property onSubmit   - Async handler that persists the progress entry.
 * @property isLoading  - When `true`, all inputs and buttons are disabled.
 */
interface ProgressLoggerModalProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  onSubmit: (data: {
    amount: number
    notes?: string
    loggedAt: Date
    isRetroactive: boolean
  }) => Promise<void>
  isLoading?: boolean
}

/**
 * Modal dialog for logging a progress entry against a goal.
 *
 * Allows the user to specify an amount, an optional date (defaulting to today),
 * and an optional note. Entries logged on a date other than today are
 * automatically flagged as retroactive. Renders `null` when `isOpen` is `false`
 * or `goal` is `null`.
 *
 * @param props - {@link ProgressLoggerModalProps}
 */
export function ProgressLoggerModal({
  isOpen,
  goal,
  onClose,
  onSubmit,
  isLoading = false,
}: ProgressLoggerModalProps) {
  const [amount, setAmount] = useState<number>(1)
  const [notes, setNotes] = useState('')
  // const [isRetroactive, setIsRetroactive] = useState(false)
  const [logDate, setLogDate] = useState(getTodayString())
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !goal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amount <= 0) {
      setError(`Amount must be greater than 0 ${goal.unit}`)
      return
    }

    try {
      // Parse the date string (YYYY-MM-DD) correctly
      // The HTML date input gives us a string in the user's local timezone
      // For retroactive entries, use midnight of the selected day
      // For current entries, use the current time to preserve time of day
      const [year, month, day] = logDate.split('-').map(Number)
      
      let loggedDate: Date
      if (!isToday) {
        // For retroactive entries, use midnight of the selected day
        loggedDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      } else {
        // For current entries, preserve the time when the user logged the progress
        loggedDate = new Date()
      }

      await onSubmit({
        amount,
        notes: notes.trim() || undefined,
        loggedAt: loggedDate,
        isRetroactive: !isToday,
      })

      // Reset form
      setAmount(1)
      setNotes('')
      // setIsRetroactive(false)
      setLogDate(getTodayString())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log progress')
    }
  }

  const today = getTodayString()
  const isToday = logDate === today
  // setIsRetroactive(!isToday)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Progress</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="progress-form">
          <div className="goal-info">
            <div
              className="goal-color"
              style={{ backgroundColor: goal.color }}
            />
            <div>
              <h3>{goal.title}</h3>
              <p>Target: {goal.targetValue} {goal.unit} per {goal.frequency}</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount {goal.unit} *</label>
            <div className="amount-input-group">
              <button
                type="button"
                className="btn-spinner"
                onClick={() => setAmount(Math.max(0, amount - 1))}
                disabled={isLoading || amount <= 1}
              >
                −
              </button>
              <input
                id="amount"
                type="number"
                min="1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 1))}
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-spinner"
                onClick={() => setAmount(amount + 1)}
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="logDate">Date</label>
            <input
              id="logDate"
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? Any notes?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Logging...' : 'Log Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
