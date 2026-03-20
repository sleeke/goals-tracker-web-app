import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import './App.css'

// Protected route component that checks if user is authenticated
/**
 * Route wrapper that redirects unauthenticated users to `/login`.
 *
 * Renders a full-viewport loading indicator while auth state is being resolved,
 * then either renders `children` (authenticated) or navigates to `/login`.
 *
 * @param children - The protected page content to render when authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Defines the application's client-side routing tree.
 *
 * - Unauthenticated users are redirected to `/login`.
 * - Authenticated users are redirected away from `/login` and `/signup` to `/dashboard`.
 * - Renders a full-viewport error screen when the auth subsystem reports a fatal error.
 * - Unknown routes fall back to `/`.
 */
function AppRoutes() {
  const { user, isLoading, error } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Check browser console for more details</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Redirect to dashboard if already logged in */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/**
 * Root application component.
 *
 * Composes `BrowserRouter`, {@link AuthProvider}, and {@link AppRoutes} into a
 * single tree that is mounted by `src/main.tsx`.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
