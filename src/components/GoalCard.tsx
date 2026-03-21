import type { Goal } from '@/types'
import './GoalCard.css'

interface GoalCardProps {
  goal: Goal
  progress: number
  progressTarget: number
  yearlyProgress: number
  onLogProgress: (goalId: string) => void
  onEdit: (goal: Goal) => void
  onViewHistory: (goal: Goal) => void
  onDelete: (goalId: string) => void
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleExpand?: () => void
}

export function GoalCard({
  goal,
  progress,
  progressTarget,
  yearlyProgress,
  onLogProgress,
  onEdit,
  onViewHistory,
  onDelete,
  isLoading = false,
  isCollapsed = false,
  onToggleExpand,
}: GoalCardProps) {
  const progressPercent = Math.min((progress / progressTarget) * 100, 100)
  const isComplete = progress >= progressTarget

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
      onDelete(goal.id!)
    }
  }

  // Format completion date
  const formatCompletedDate = () => {
    if (!goal.completedDate) return ''
    const date = new Date(goal.completedDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Collapsed view for completed goals
  if (isCollapsed && goal.status === 'completed') {
    return (
      <div className="goal-card goal-card--collapsed">
        <div className="collapsed-content">
          <div className="collapsed-title-section">
            <h3 className="collapsed-title">{goal.title}</h3>
            <span className="collapsed-date">Completed {formatCompletedDate()}</span>
          </div>
          <button
            className="btn-toggle-expand"
            onClick={onToggleExpand}
            title="Expand"
            disabled={isLoading}
            aria-label="Expand completed goal"
          >
            ▶
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`goal-card ${goal.status} ${isComplete ? 'complete' : ''}`}>
      <div className="goal-card-header">
        <div className="goal-card-title">
          <div
            className="goal-color-indicator"
            style={{ backgroundColor: goal.color }}
            title={`Goal Color: ${goal.color}`}
          />
          <div>
            <h3>{goal.title}</h3>
            <p className="goal-frequency">
              {goal.frequency.charAt(0).toUpperCase() + goal.frequency.slice(1)} • {goal.targetValue}{' '}
              {goal.unit}
            </p>
          </div>
        </div>
        <div className="goal-card-actions">
          {goal.status === 'completed' && onToggleExpand && (
            <button
              className="btn-icon"
              onClick={onToggleExpand}
              title="Collapse goal"
              disabled={isLoading}
              aria-label="Collapse goal"
            >
              ▼
            </button>
          )}
          <button
            className="btn-icon"
            onClick={() => onEdit(goal)}
            title="Edit goal"
            disabled={isLoading}
            aria-label="Edit goal"
          >
            ✏️
          </button>
          <button
            className="btn-icon"
            onClick={() => onViewHistory(goal)}
            title="View progress history"
            disabled={isLoading}
            aria-label="View progress history"
          >
            📋
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={handleDelete}
            title="Delete goal"
            disabled={isLoading}
            aria-label="Delete goal"
          >
            🗑️
          </button>
        </div>
      </div>

      {goal.description && <p className="goal-description">{goal.description}</p>}

      <div className="goal-progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar-background">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
        </div>
        <div className="progress-text">
          <span className="progress-value">
            {progress} / {progressTarget} {goal.unit}
          </span>
          <span className="progress-percent">{Math.round(progressPercent)}%</span>
        </div>
        <div className="yearly-progress-text">
          📊 Yearly: {yearlyProgress} {goal.unit}
        </div>
      </div>

      {isComplete && (
        <div className="goal-complete-badge">
          <span>✅ Target reached!</span>
        </div>
      )}

      <div className="goal-card-footer">
        {goal.status === 'active' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onLogProgress(goal.id!)}
            disabled={isLoading}
          >
            Log Progress
          </button>
        )}
        {goal.status === 'archived' && (
          <span className="status-badge archived">Archived</span>
        )}
      </div>
    </div>
  )
}
