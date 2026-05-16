import './DaySelector.css'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

interface DaySelectorProps {
  /** Selected day indices (0=Sun … 6=Sat). Empty/undefined means every day. */
  value: number[]
  onChange: (days: number[]) => void
  disabled?: boolean
}

export function DaySelector({ value, onChange, disabled = false }: DaySelectorProps) {
  const toggle = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="day-selector" role="group" aria-label="Applicable days of week">
      {DAY_LABELS.map((label, index) => {
        const isSelected = value.includes(index)
        return (
          <button
            key={index}
            type="button"
            className={`day-selector__btn${isSelected ? ' day-selector__btn--selected' : ''}`}
            onClick={() => toggle(index)}
            disabled={disabled}
            aria-label={DAY_FULL_NAMES[index]}
            aria-pressed={isSelected}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
