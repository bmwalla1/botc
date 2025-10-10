import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { grimoireApi } from '../services/api'
import './Navigation.css'

function Navigation() {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasActiveGame, setHasActiveGame] = useState(false)

  // Check if there's an active game
  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        const grimoireState = await grimoireApi.getGrimoire()
        const hasGame = grimoireState && grimoireState.players && grimoireState.players.length > 0
        setHasActiveGame(prev => prev !== hasGame ? hasGame : prev)
      } catch (error) {
        setHasActiveGame(false)
      }
    }

    checkActiveGame()
    
    // Check every 10 seconds for active game status (reduced frequency)
    const interval = setInterval(checkActiveGame, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-nav') && !event.target.closest('.mobile-menu-button')) {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          Blood on the Clocktower
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
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
          {hasActiveGame && (
            <Link 
              to="/current-game" 
              className={`nav-link ${location.pathname === '/current-game' ? 'active' : ''}`}
            >
              Current Game
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/create-script" 
              className={`nav-link ${location.pathname === '/create-script' ? 'active' : ''}`}
            >
              Create Script
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/scripts" 
              className={`nav-link ${location.pathname === '/scripts' ? 'active' : ''}`}
            >
              Scripts
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/grimoire" 
              className={`nav-link ${location.pathname === '/grimoire' ? 'active' : ''}`}
            >
              Grimoire
            </Link>
          )}
        </div>

        <div className="nav-auth desktop-nav">
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

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <Link 
            to="/" 
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/characters" 
            className={`mobile-nav-link ${location.pathname === '/characters' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Characters
          </Link>
          {hasActiveGame && (
            <Link 
              to="/current-game" 
              className={`mobile-nav-link ${location.pathname === '/current-game' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Current Game
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/create-script" 
              className={`mobile-nav-link ${location.pathname === '/create-script' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Create Script
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/scripts" 
              className={`mobile-nav-link ${location.pathname === '/scripts' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Scripts
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/grimoire" 
              className={`mobile-nav-link ${location.pathname === '/grimoire' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Grimoire
            </Link>
          )}
          <div className="mobile-nav-auth">
            {isAuthenticated ? (
              <button onClick={() => { logout(); closeMobileMenu(); }} className="mobile-logout-button">
                Logout
              </button>
            ) : (
              <Link to="/login" className="mobile-login-link" onClick={closeMobileMenu}>
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
