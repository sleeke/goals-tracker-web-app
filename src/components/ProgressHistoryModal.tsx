import { useState, useEffect } from 'react'
import type { Goal, Progress } from '@/types'
import { getGoalProgress, deleteProgress } from '@/services/progressService'
import './ProgressHistoryModal.css'

interface ProgressHistoryModalProps {
  isOpen: boolean
  goal: Goal | null
  onClose: () => void
  isLoading?: boolean
}

/**
 * Formats a date into a friendly, human-readable string
 * Examples: "Today at 2:30 PM", "Yesterday at 10:15 AM", "Jan 15, 2024 at 3:45 PM"
 */
function formatProgressDate(dateInput: any): string {
  // Convert to Date object if it's a Firestore Timestamp or other format
  let date: Date
  
  if (dateInput instanceof Date) {
    date = dateInput
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    // Firestore Timestamp object
    date = dateInput.toDate()
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else {
    // Fallback - return current time string if we can't parse
    console.warn('Unable to parse date:', dateInput)
    return 'Unknown date'
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const progressDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  let dateStr: string
  if (progressDate.getTime() === today.getTime()) {
    dateStr = 'Today'
  } else if (progressDate.getTime() === yesterday.getTime()) {
    dateStr = 'Yesterday'
  } else {
    // Format as "Jan 15, 2024"
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    dateStr = date.toLocaleDateString('en-US', options)
  }

  // Format time as "2:30 PM"
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
  const timeStr = date.toLocaleTimeString('en-US', timeOptions)

  return `${dateStr} at ${timeStr}`
}

export function ProgressHistoryModal({
  isOpen,
  goal,
  onClose,
  isLoading = false,
}: ProgressHistoryModalProps) {
  const [progressHistory, setProgressHistory] = useState<Progress[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load progress history when modal opens
  useEffect(() => {
    if (isOpen && goal?.id) {
      loadProgressHistory()
    }
  }, [isOpen, goal?.id])

  const loadProgressHistory = async () => {
    if (!goal?.id) return

    try {
      setHistoryLoading(true)
      setError(null)
      const history = await getGoalProgress(goal.id)
      // Ensure all dates are properly converted to Date objects
      const processedHistory = history.map(item => ({
        ...item,
        loggedAt: item.loggedAt instanceof Date ? item.loggedAt : new Date(item.loggedAt),
        timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
      }))
      setProgressHistory(processedHistory)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load progress history'
      setError(message)
      console.error('Error loading progress history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleDeleteProgress = async (progressId: string) => {
    if (!confirm('Are you sure you want to remove this progress entry?')) {
      return
    }

    try {
      setDeletingId(progressId)
      setError(null)
      await deleteProgress(progressId)
      // Remove from local state
      setProgressHistory((prev) => prev.filter((p) => p.id !== progressId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete progress'
      setError(message)
      console.error('Error deleting progress:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen || !goal) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content progress-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Progress History: {goal.title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="progress-history-container">
          {historyLoading ? (
            <div className="loading-state">
              <p>Loading progress history...</p>
            </div>
          ) : progressHistory.length === 0 ? (
            <div className="empty-state">
              <p>No progress entries yet.</p>
              <p className="empty-state-hint">Start logging progress to see history here.</p>
            </div>
          ) : (
            <div className="progress-list">
              {progressHistory.map((progress) => (
                <div key={progress.id} className="progress-item">
                  <div className="progress-item-content">
                    <div className="progress-item-header">
                      <span className="progress-value">
                        +{progress.value} {goal.unit}
                      </span>
                      <span className="progress-date">{formatProgressDate(progress.loggedAt)}</span>
                    </div>
                    {progress.note && (
                      <p className="progress-note">{progress.note}</p>
                    )}
                    {progress.isRetroactive && (
                      <span className="progress-badge retroactive">Retroactive</span>
                    )}
                  </div>
                  <button
                    className="btn-icon btn-danger progress-delete"
                    onClick={() => handleDeleteProgress(progress.id)}
                    disabled={deletingId === progress.id || isLoading}
                    title="Remove this progress entry"
                    aria-label="Remove progress entry"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={historyLoading}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
