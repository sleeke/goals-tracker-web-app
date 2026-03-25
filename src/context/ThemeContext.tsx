import { useState, useEffect, type ReactNode } from 'react'
import { type Theme, THEMES, ThemeContext } from './theme'

const VALID_THEMES = new Set<string>(THEMES.map((t) => t.id))

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('goal-tracker-theme')
  if (saved && VALID_THEMES.has(saved)) return saved as Theme
  // Migrate old 'dark' / 'light' values
  if (saved === 'dark')  return 'nebula'
  if (saved === 'light') return 'nebula-light'
  return 'nebula'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('goal-tracker-theme', theme)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  const toggleTheme = () => {
    const idx = THEMES.findIndex((t) => t.id === theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setThemeState(next.id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// `useTheme` is provided from `src/context/theme.ts`
