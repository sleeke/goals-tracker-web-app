import { createContext, useContext } from 'react'

export type Theme =
  | 'nebula'
  | 'nebula-light'
  | 'magenta-bloom'
  | 'arctic'
  | 'parchment'

export type ThemeMode = 'dark' | 'light'

export const THEMES: { id: Theme; label: string; mode: ThemeMode }[] = [
  { id: 'nebula',        label: 'Nebula',       mode: 'dark'  },
  { id: 'magenta-bloom', label: 'Magenta Bloom', mode: 'dark'  },
  { id: 'arctic',        label: 'Arctic',        mode: 'dark'  },
  { id: 'nebula-light',  label: 'Nebula',        mode: 'light' },
  { id: 'parchment',     label: 'Parchment',     mode: 'light' },
]

export const DARK_THEMES  = THEMES.filter((t) => t.mode === 'dark')
export const LIGHT_THEMES = THEMES.filter((t) => t.mode === 'light')

export interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  /** The preferred theme to use in dark system mode */
  darkTheme: Theme
  /** The preferred theme to use in light system mode */
  lightTheme: Theme
  setDarkTheme: (t: Theme) => void
  setLightTheme: (t: Theme) => void
  /** When true, the app auto-switches theme based on system prefers-color-scheme */
  autoTheme: boolean
  setAutoTheme: (v: boolean) => void
  /** Convenience: cycle to next theme */
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
