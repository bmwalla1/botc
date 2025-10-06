import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navigation.css'

function Navigation() {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Blood on the Clocktower
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/characters" 
            className={`nav-link ${location.pathname === '/characters' ? 'active' : ''}`}
          >
            Characters
          </Link>
          {isAuthenticated && (
            <Link 
              to="/create-script" 
              className={`nav-link ${location.pathname === '/create-script' ? 'active' : ''}`}
            >
              Create Script
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {isAuthenticated ? (
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-link">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
