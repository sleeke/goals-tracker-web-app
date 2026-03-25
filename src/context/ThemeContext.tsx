import { useState, useEffect, type ReactNode } from 'react'
import { type Theme, THEMES, ThemeContext } from './theme'

const DEFAULT_DARK_THEME:  Theme = 'nebula'
const DEFAULT_LIGHT_THEME: Theme = 'nebula-light'

function isValidTheme(id: string | null): id is Theme {
  return !!id && THEMES.some((t) => t.id === id)
}

function getSaved(key: string, fallback: Theme): Theme {
  const v = localStorage.getItem(key)
  return isValidTheme(v) ? v : fallback
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkTheme, setDarkThemeState] = useState<Theme>(() =>
    getSaved('goal-tracker-dark-theme', DEFAULT_DARK_THEME)
  )
  const [lightTheme, setLightThemeState] = useState<Theme>(() =>
    getSaved('goal-tracker-light-theme', DEFAULT_LIGHT_THEME)
  )
  const [autoTheme, setAutoThemeState] = useState<boolean>(() => {
    const v = localStorage.getItem('goal-tracker-auto-theme')
    return v !== 'false' // default true
  })
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  // manualTheme is used when autoTheme is disabled
  const [manualTheme, setManualTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('goal-tracker-theme')
    if (isValidTheme(saved)) return saved
    if (saved === 'dark')  return DEFAULT_DARK_THEME
    if (saved === 'light') return DEFAULT_LIGHT_THEME
    return DEFAULT_DARK_THEME
  })

  // Active theme derived from auto / manual mode
  const theme: Theme = autoTheme
    ? (systemPrefersDark ? darkTheme : lightTheme)
    : manualTheme

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (!autoTheme) {
      localStorage.setItem('goal-tracker-theme', theme)
    }
  }, [theme, autoTheme])

  // Track system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setDarkTheme = (t: Theme) => {
    setDarkThemeState(t)
    localStorage.setItem('goal-tracker-dark-theme', t)
  }

  const setLightTheme = (t: Theme) => {
    setLightThemeState(t)
    localStorage.setItem('goal-tracker-light-theme', t)
  }

  const setAutoTheme = (v: boolean) => {
    setAutoThemeState(v)
    localStorage.setItem('goal-tracker-auto-theme', String(v))
  }

  const setTheme = (t: Theme) => {
    setManualTheme(t)
    localStorage.setItem('goal-tracker-theme', t)
  }

  const toggleTheme = () => {
    const idx = THEMES.findIndex((t) => t.id === theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next.id)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      darkTheme,
      lightTheme,
      setDarkTheme,
      setLightTheme,
      autoTheme,
      setAutoTheme,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// `useTheme` is provided from `src/context/theme.ts`
