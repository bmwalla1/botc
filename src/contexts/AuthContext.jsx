import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (stored in localStorage)
    const savedAuth = localStorage.getItem('botc-auth')
    if (savedAuth === 'admin') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (username, password) => {
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true)
      localStorage.setItem('botc-auth', 'admin')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('botc-auth')
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
