import { useState } from 'react'
import type { Goal } from '@/types'
import './ProgressLogger.css'

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

export function ProgressLoggerModal({
  isOpen,
  goal,
  onClose,
  onSubmit,
  isLoading = false,
}: ProgressLoggerModalProps) {
  const [amount, setAmount] = useState<number>(1)
  const [notes, setNotes] = useState('')
  const [isRetroactive, setIsRetroactive] = useState(false)
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
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
      const loggedDate = new Date(logDate)
      loggedDate.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

      await onSubmit({
        amount,
        notes: notes.trim() || undefined,
        loggedAt: loggedDate,
        isRetroactive,
      })

      // Reset form
      setAmount(1)
      setNotes('')
      setIsRetroactive(false)
      setLogDate(new Date().toISOString().split('T')[0])
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log progress')
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = logDate === today

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
            {!isToday && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isRetroactive}
                  onChange={(e) => setIsRetroactive(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Retroactive entry</span>
              </label>
            )}
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
