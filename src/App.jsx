import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Login from './components/Login'
import Characters from './components/Characters'
import './App.css'

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
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
        {isAuthenticated ? (
          <div className="admin-message">
            <p>You are logged in as admin. You can create scripts and manage the game.</p>
          </div>
        ) : (
          <div className="user-message">
            <p>The storyteller needs to create a script before the game can begin.</p>
          </div>
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
                    <div className="create-script-placeholder">
                      <h2>Create Script</h2>
                      <p>Script creation interface will go here.</p>
                    </div>
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
