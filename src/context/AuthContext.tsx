import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import type { User } from '@/types'

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
