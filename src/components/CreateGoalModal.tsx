import { useState } from 'react'
import type { Goal } from '@/types'
import './GoalModal.css'

/**
 * Props for the {@link CreateGoalModal} component.
 *
 * @property isOpen     - Controls modal visibility.
 * @property onClose    - Called when the modal should close (cancel or after successful creation).
 * @property onCreate   - Async handler that persists the new goal; receives all fields except
 *                        server-generated `id`, `createdAt`, and `updatedAt`.
 * @property isLoading  - When `true`, all inputs and buttons are disabled.
 */
interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  isLoading?: boolean
}

/**
 * Modal dialog for creating a new goal.
 *
 * Manages its own form state and resets on successful creation. Validates
 * that `title` is non-empty and `targetValue` is greater than zero before
 * calling `onCreate`. Renders `null` when `isOpen` is `false`.
 *
 * @param props - {@link CreateGoalModalProps}
 */
export function CreateGoalModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [targetValue, setTargetValue] = useState<number>(1)
  const [unit, setUnit] = useState('units')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [color, setColor] = useState('#667eea')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Goal title is required')
      return
    }

    if (targetValue <= 0) {
      setError('Target must be greater than 0')
      return
    }

    try {
      await onCreate({
        userId: '', // Will be set by the service
        title: title.trim(),
        description: description.trim(),
        category,
        frequency,
        targetValue,
        unit,
        priority,
        color,
        status: 'active',
        notes: '',
      })

      // Reset form
      setTitle('')
      setDescription('')
      setCategory('personal')
      setFrequency('daily')
      setTargetValue(1)
      setUnit('units')
      setPriority('medium')
      setColor('#667eea')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Goal</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="title">Goal Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read a book, Exercise, Meditate"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve with this goal?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Health, Learning, Work"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Frequency *</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                disabled={isLoading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetValue">Target *</label>
              <input
                id="targetValue"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                id="unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., pages, minutes, km"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-picker-row">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading}
              />
              <span className="color-preview" style={{ backgroundColor: color }} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
