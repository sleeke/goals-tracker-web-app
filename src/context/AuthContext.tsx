import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { User } from '@/types'

/**
 * Shape of the authentication context value provided by {@link AuthProvider}.
 *
 * @property user        - The currently authenticated application user, or `null` when unauthenticated.
 * @property isLoading   - `true` while Firebase is resolving the initial auth state.
 * @property error       - A human-readable error message from the last failed auth operation, or `null`.
 * @property signup      - Creates a new Firebase account with the given credentials.
 * @property login       - Signs in an existing user with email and password.
 * @property logout      - Signs out the current user and clears local state.
 * @property clearError  - Clears the current {@link error} value.
 */
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Context provider that manages Firebase authentication state for the entire app.
 *
 * Wraps Firebase's `onAuthStateChanged` listener and exposes auth operations
 * ({@link AuthContextType.signup}, {@link AuthContextType.login}, {@link AuthContextType.logout})
 * to all descendant components via `AuthContext`.
 *
 * A 10-second timeout guard prevents the UI from hanging if Firebase fails to
 * initialize (e.g. due to missing environment variables).
 *
 * @param children - React subtree that should have access to auth state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for auth state changes
  useEffect(() => {
    console.log('[AuthContext] Initializing auth state listener')
    let mounted = true
    
    // Set a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[AuthContext] Auth initialization timeout after 10s')
        setIsLoading(false)
        setError('Authentication initialization timeout. Check Firebase configuration.')
      }
    }, 10000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return
      
      try {
        console.log('[AuthContext] Auth state changed:', firebaseUser?.uid ? 'User logged in' : 'User logged out')
        if (firebaseUser) {
          // Convert Firebase user to our User type
          const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
              theme: 'light',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notificationsEnabled: true,
              dataExportFormat: 'csv',
            },
            lastSyncTime: new Date(),
          }
          setUser(appUser)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('[AuthContext] Error setting user:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        if (mounted) {
          setIsLoading(false)
          clearTimeout(initTimeout)
        }
      }
    }, (authError) => {
      console.error('[AuthContext] Auth state change error:', authError)
      if (mounted) {
        setError(authError instanceof Error ? authError.message : 'Authentication error')
        setIsLoading(false)
        clearTimeout(initTimeout)
      }
    })

    return () => {
      mounted = false
      clearTimeout(initTimeout)
      unsubscribe()
    }
  }, [])

  const signup = async (email: string, password: string, displayName?: string) => {
    setError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // Optionally update display name
      if (displayName && result.user) {
        // Note: In a real app, you might update the user profile here
        // updateProfile(result.user, { displayName })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signup,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook that returns the current {@link AuthContextType} value.
 *
 * Must be called from inside an {@link AuthProvider} — throws if used outside.
 *
 * @returns The current authentication context.
 * @throws {Error} When called outside of an `AuthProvider`.
 *
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
