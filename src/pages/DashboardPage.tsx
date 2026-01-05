import { useAuth } from '@/context/AuthContext'
import './DashboardPage.css'

export function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Goal Tracker</h1>
        <div className="user-menu">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.displayName || user?.email?.split('@')[0]}! 👋</h2>
          <p>Your Goal Tracker is ready to use.</p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>📋 Create Goals</h3>
              <p>Set daily, weekly, or monthly goals to track your progress.</p>
            </div>

            <div className="feature-card">
              <h3>📊 Track Progress</h3>
              <p>Log your progress and see how you're doing against your targets.</p>
            </div>

            <div className="feature-card">
              <h3>📈 View Analytics</h3>
              <p>Visualize your progress with charts and detailed insights.</p>
            </div>

            <div className="feature-card">
              <h3>📱 Offline Support</h3>
              <p>Use the app offline and sync automatically when online.</p>
            </div>
          </div>

          <div className="placeholder-message">
            <p>🚀 More features coming soon!</p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Goal management, progress tracking, and analytics are under development.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
