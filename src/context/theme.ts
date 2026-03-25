import { createContext, useContext } from 'react'

export type Theme =
  | 'nebula'
  | 'nebula-light'
  | 'magenta-bloom'
  | 'arctic'
  | 'parchment'

export const THEMES: { id: Theme; label: string }[] = [
  { id: 'nebula',        label: 'Nebula (dark)' },
  { id: 'nebula-light',  label: 'Nebula (light)' },
  { id: 'magenta-bloom', label: 'Magenta Bloom' },
  { id: 'arctic',        label: 'Arctic' },
  { id: 'parchment',     label: 'Parchment' },
]

export interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
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
