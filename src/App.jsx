import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Login from './components/Login'
import CreateScript from './components/CreateScript'
import Scripts from './components/Scripts'
import Characters from './components/Characters'
import './App.css'
import { characterDetails } from './data/characters'

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeScript, setActiveScript] = useState(null)
  const [isLoadingScript, setIsLoadingScript] = useState(true)

  useEffect(() => {
    const loadActiveScript = async () => {
      try {
        setIsLoadingScript(true)
        const { getActiveScript } = await import('./data/scripts')
        const script = await getActiveScript()
        setActiveScript(script)
      } catch (error) {
        console.error('Failed to load active script:', error)
      } finally {
        setIsLoadingScript(false)
      }
    }
    
    loadActiveScript()
  }, [])

  if (isLoading || isLoadingScript) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="home-content">
        <h1>Blood on the Clocktower Script Builder</h1>
        <p>Welcome to your custom script creation tool!</p>
        {activeScript && (
          <>
            <div className="admin-message">
              <p>Active Script: <strong>{activeScript.name}</strong></p>
            </div>
            <div className="home-script">
              {(['townsfolk','outsiders','minions','demons']).map(group => (
                <div key={group} className="script-group">
                  <div className="script-group-header">
                    <span className={`pill pill-${group}`}>{group.toUpperCase()}</span>
                    <span className="count">{activeScript.groups[group]?.length || 0}</span>
                  </div>
                  <div className="script-list">
                    {(activeScript.groups[group] || []).map(slug => {
                      const d = characterDetails[slug]
                      return (
                        <div key={slug} className="script-row" style={{ gridTemplateColumns: '54px 200px 1fr' }}>
                          <img className="row-icon" src={d?.image} alt={d?.name} />
                          <div className="row-name">{d?.name}</div>
                          <div className="row-blurb">{d?.blurb}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {isAuthenticated ? (
          <div className="admin-message">
            <p>You are logged in as admin. You can create scripts and manage the game.</p>
          </div>
        ) : (
          !activeScript && (
            <div className="user-message">
              <p>The storyteller needs to create a script before the game can begin.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/characters" element={<Characters />} />
              <Route 
                path="/create-script" 
                element={
                  <ProtectedRoute>
                    <CreateScript />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scripts" 
                element={
                  <ProtectedRoute>
                    <Scripts />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
