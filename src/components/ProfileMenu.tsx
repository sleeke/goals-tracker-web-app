import { useRef, useEffect, useState } from 'react'
import { useTheme } from '@/context/theme'
import { DARK_THEMES, LIGHT_THEMES, type Theme } from '@/context/theme'
import './ProfileMenu.css'

interface ProfileMenuProps {
  userEmail: string | null | undefined
  onLogout: () => void
}

export function ProfileMenu({ userEmail, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    darkTheme, lightTheme, setDarkTheme, setLightTheme,
    autoTheme, setAutoTheme,
    theme, setTheme,
  } = useTheme()

  // Derive current colour-scheme from active theme
  const isDarkMode = DARK_THEMES.some((t) => t.id === theme)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleModeToggle = () => {
    // Switch to the preferred theme for the opposite mode
    setTheme(isDarkMode ? lightTheme : darkTheme)
  }

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button
        className="btn-profile"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="material-icons-outlined">person</span>
      </button>

      {open && (
        <div className="profile-dropdown" role="menu">
          {/* User email */}
          <div className="profile-section profile-email">
            <span className="material-icons-outlined profile-email-icon">account_circle</span>
            <span className="profile-email-text">{userEmail}</span>
          </div>

          <div className="profile-divider" />

          {/* Theme picker */}
          <div className="profile-section">
            <div className="profile-section-label">Theme</div>

            {/* Auto-switch toggle */}
            <label className="profile-auto-toggle">
              <span className="material-icons-outlined profile-auto-icon">brightness_auto</span>
              <span className="profile-auto-label">Auto (follows system)</span>
              <input
                type="checkbox"
                checked={autoTheme}
                onChange={(e) => setAutoTheme(e.target.checked)}
                className="profile-auto-checkbox"
              />
              <span className="profile-toggle-track">
                <span className="profile-toggle-thumb" />
              </span>
            </label>

            {/* Dark / Light mode toggle */}
            <div className={`profile-mode-toggle-row${autoTheme ? ' profile-mode-disabled' : ''}`}>
              <span className="material-icons-outlined profile-mode-icon">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="profile-mode-label">
                {isDarkMode ? 'Dark mode' : 'Light mode'}
              </span>
              <button
                className="profile-mode-btn"
                onClick={handleModeToggle}
                disabled={autoTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="material-icons-outlined">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
                Switch
              </button>
            </div>

            <div className="profile-theme-group">
              <div className="profile-theme-group-label">
                <span className="material-icons-outlined">dark_mode</span>
                Dark
              </div>
              {DARK_THEMES.map((t) => (
                <label key={t.id} className="profile-theme-option">
                  <input
                    type="radio"
                    name="dark-theme"
                    value={t.id}
                    checked={darkTheme === t.id}
                    onChange={() => setDarkTheme(t.id as Theme)}
                  />
                  <span className="profile-theme-label">{t.label}</span>
                </label>
              ))}
            </div>

            <div className="profile-theme-group">
              <div className="profile-theme-group-label">
                <span className="material-icons-outlined">light_mode</span>
                Light
              </div>
              {LIGHT_THEMES.map((t) => (
                <label key={t.id} className="profile-theme-option">
                  <input
                    type="radio"
                    name="light-theme"
                    value={t.id}
                    checked={lightTheme === t.id}
                    onChange={() => setLightTheme(t.id as Theme)}
                  />
                  <span className="profile-theme-label">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="profile-divider" />

          {/* Logout */}
          <div className="profile-section">
            <button
              className="profile-logout-btn"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
            >
              <span className="material-icons-outlined">logout</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
