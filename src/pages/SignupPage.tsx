import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './AuthPages.css'

/**
 * Sign-up page component that renders the account creation form.
 *
 * Performs client-side validation (password length, match, valid email) before
 * calling `signup()` from {@link useAuth}. On success, navigates to `/dashboard`.
 * Both validation errors and Firebase auth errors are displayed inline.
 */
export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { signup, error, clearError } = useAuth()
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    setValidationError(null)

    if (!email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields')
      return false
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return false
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }

    if (!email.includes('@')) {
      setValidationError('Please enter a valid email')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    clearError()

    try {
      await signup(email, password, displayName)
      navigate('/dashboard')
    } catch (err) {
      console.error('Signup failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = validationError || error

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Goal Tracker</h1>
        <h2>Create Account</h2>

        {displayError && <div className="error-message">{displayError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Name (optional)</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <small>Minimum 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !confirmPassword}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
