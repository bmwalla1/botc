import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Login from './components/Login'
import CreateScript from './components/CreateScript'
import Scripts from './components/Scripts'
import Characters from './components/Characters'
import Grimoire from './components/Grimoire'
import CurrentGame from './components/CurrentGame'
import './App.css'
import { characterDetails } from './data/characters'

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeScript, setActiveScript] = useState(null)
  const [isLoadingScript, setIsLoadingScript] = useState(true)
  const [expandedJinxes, setExpandedJinxes] = useState({})

  const toggleJinxes = (characterSlug) => {
    setExpandedJinxes(prev => ({
      ...prev,
      [characterSlug]: !prev[characterSlug]
    }))
  }

  // Helper function to get character type priority (higher number = higher priority)
  const getCharacterTypePriority = (characterSlug) => {
    if (characterDetails[characterSlug]?.type === 'demons') return 4
    if (characterDetails[characterSlug]?.type === 'minions') return 3
    if (characterDetails[characterSlug]?.type === 'outsiders') return 2
    if (characterDetails[characterSlug]?.type === 'townsfolk') return 1
    return 0
  }

  // Helper function to deduplicate jinxes between character pairs
  const deduplicateJinxes = (allScriptCharacters) => {
    const jinxMap = new Map() // key: sorted character pair, value: { jinx, displayCharacter }
    
    allScriptCharacters.forEach(characterSlug => {
      const character = characterDetails[characterSlug]
      if (!character?.jinxes) return
      
      character.jinxes.forEach(jinx => {
        if (!allScriptCharacters.includes(jinx.character)) return
        
        // Create a sorted key for the character pair
        const pair = [characterSlug, jinx.character].sort()
        const pairKey = pair.join('|')
        
        // Check if we already have this jinx pair
        if (jinxMap.has(pairKey)) {
          const existing = jinxMap.get(pairKey)
          const currentPriority = getCharacterTypePriority(characterSlug)
          const existingPriority = getCharacterTypePriority(existing.displayCharacter)
          
          // Keep the jinx on the character with higher priority (evil characters)
          if (currentPriority > existingPriority) {
            jinxMap.set(pairKey, { jinx, displayCharacter: characterSlug })
          }
        } else {
          jinxMap.set(pairKey, { jinx, displayCharacter: characterSlug })
        }
      })
    })
    
    return jinxMap
  }

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
              {(['townsfolk','outsiders','minions','demons']).map(group => {
                // Get all characters in the current script for deduplication
                const allScriptCharacters = Object.values(activeScript.groups).flat()
                const deduplicatedJinxes = deduplicateJinxes(allScriptCharacters)
                
                return (
                  <div key={group} className="script-group">
                    <div className="script-group-header">
                      <span className={`pill pill-${group}`}>{group.toUpperCase()}</span>
                      <span className="count">{activeScript.groups[group]?.length || 0}</span>
                    </div>
                    <div className="script-list">
                      {(activeScript.groups[group] || []).map(slug => {
                        const d = characterDetails[slug]
                        
                        // Find jinxes that should be displayed on this character (after deduplication)
                        const relevantJinxes = []
                        deduplicatedJinxes.forEach(({ jinx, displayCharacter }) => {
                          if (displayCharacter === slug) {
                            relevantJinxes.push(jinx)
                          }
                        })
                      
                      return (
                        <div key={slug} className="character-container">
                          <div 
                            className="script-row clickable-row" 
                            style={{ gridTemplateColumns: '54px 200px 1fr auto' }}
                            onClick={() => window.open(d?.url, '_blank')}
                            title={`Click to open ${d?.name} wiki page`}
                          >
                            <img className="row-icon" src={d?.image} alt={d?.name} />
                            <div className="row-name">{d?.name}</div>
                            <div className="row-blurb">{d?.blurb}</div>
                            {relevantJinxes.length > 0 && (
                              <button 
                                className="jinx-toggle"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleJinxes(slug)
                                }}
                                title={expandedJinxes[slug] ? 'Hide jinxes' : 'Show jinxes'}
                              >
                                <span className="jinx-label">Jinxes</span>
                                <span className="jinx-arrow">{expandedJinxes[slug] ? '▼' : '▶'}</span>
                              </button>
                            )}
                          </div>
                          {relevantJinxes.length > 0 && expandedJinxes[slug] && (
                            <div className="jinx-container">
                              {relevantJinxes.map((jinx, index) => {
                                const jinxCharacter = characterDetails[jinx.character]
                                return (
                                  <div key={`${slug}-jinx-${index}`} className="jinx-row" style={{ gridTemplateColumns: '54px 200px 1fr' }}>
                                    <img className="row-icon" src={jinxCharacter?.image} alt={jinxCharacter?.name} />
                                    <div className="row-name">{jinxCharacter?.name}</div>
                                    <div className="row-blurb jinx-description">{jinx.description}</div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                )
              })}
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
              <Route 
                path="/grimoire" 
                element={
                  <ProtectedRoute>
                    <Grimoire />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/current-game" 
                element={<CurrentGame />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
