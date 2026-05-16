import { fireEvent, render, screen, waitFor } from '@/test/test-utils'
import { EditGoalModal } from './EditGoalModal'
import type { Goal } from '@/types'
import { describe, expect, it, vi } from 'vitest'

const baseGoal: Goal = {
  id: 'goal-1',
  userId: 'user-1',
  title: 'Read',
  description: 'Read daily',
  category: 'personal',
  frequency: 'daily',
  targetValue: 1,
  unit: 'pages',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  status: 'active',
  priority: 'medium',
  color: '#667eea',
}

describe('EditGoalModal', () => {
  it('allows clearing and setting a new target before saving', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <EditGoalModal
        isOpen
        goal={baseGoal}
        onClose={onClose}
        onSave={onSave}
      />
    )

    const targetInput = screen.getByLabelText(/target/i) as HTMLInputElement
    fireEvent.change(targetInput, { target: { value: '' } })
    expect(targetInput.value).toBe('')

    fireEvent.change(targetInput, { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        baseGoal.id,
        expect.objectContaining({ targetValue: 5 })
      )
    })
  })

  it('uses compact native numeric stepping controls', () => {
    render(
      <EditGoalModal
        isOpen
        goal={baseGoal}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    )

    const targetInput = screen.getByLabelText(/target/i)
    expect(targetInput).toHaveAttribute('type', 'number')
    expect(targetInput).toHaveAttribute('min', '1')
    expect(targetInput).toHaveAttribute('step', '1')
  })
})
