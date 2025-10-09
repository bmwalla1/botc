import { useState, useEffect } from 'react'
import { characterDetails } from '../data/characters'
import { grimoireApi } from '../services/api'
import './Grimoire.css'

function Grimoire() {
  const [activeScript, setActiveScript] = useState(null)
  const [isLoadingScript, setIsLoadingScript] = useState(true)
  const [players, setPlayers] = useState([])
  const [playerNames, setPlayerNames] = useState('')
  const [showPlayerInput, setShowPlayerInput] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showCharacterModal, setShowCharacterModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isLoadingGrimoire, setIsLoadingGrimoire] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingScript(true)
        setIsLoadingGrimoire(true)
        
        // Load active script
        const { getActiveScript } = await import('../data/scripts')
        const script = await getActiveScript()
        setActiveScript(script)
        
        // Load grimoire state
        const grimoireState = await grimoireApi.getGrimoire()
        setPlayers(grimoireState.players || [])
        
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoadingScript(false)
        setIsLoadingGrimoire(false)
      }
    }
    
    loadData()
  }, [])

  // Save grimoire state whenever players change
  useEffect(() => {
    if (!isLoadingGrimoire && players.length > 0) {
      saveGrimoireState()
    }
  }, [players, isLoadingGrimoire])

  const saveGrimoireState = async () => {
    try {
      setIsSaving(true)
      await grimoireApi.updateGrimoire(players, players.length > 0)
    } catch (error) {
      console.error('Failed to save grimoire state:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddPlayers = async () => {
    const names = playerNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .slice(0, 20) // Limit to 20 players
    
    if (names.length === 0) return
    
    const newPlayers = names.map((name, index) => ({
      id: index,
      name,
      character: null,
      position: index,
      isDead: false,
      hasGhostVote: false
    }))
    
    setPlayers(newPlayers)
    setPlayerNames('')
    setShowPlayerInput(false)
  }

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player)
    if (player.character) {
      setShowStatusModal(true)
    } else {
      setShowCharacterModal(true)
    }
  }

  const handleCharacterSelect = (characterSlug) => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, character: characterSlug, isDead: false, hasGhostVote: false }
        : player
    ))
    
    setShowCharacterModal(false)
    setSelectedPlayer(null)
  }

  const handleRemoveCharacter = (playerId) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, character: null }
        : player
    ))
  }

  const handleNewGame = async () => {
    try {
      setIsSaving(true)
      await grimoireApi.startNewGame()
      setPlayers([])
      setShowPlayerInput(false)
      setPlayerNames('')
    } catch (error) {
      console.error('Failed to start new game:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUnassignCharacter = () => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, character: null, isDead: false, hasGhostVote: false }
        : player
    ))
    
    setShowStatusModal(false)
    setSelectedPlayer(null)
  }

  const handleMarkDead = () => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, isDead: true, hasGhostVote: true }
        : player
    ))
    
    setShowStatusModal(false)
    setSelectedPlayer(null)
  }

  const handleMarkAlive = () => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, isDead: false, hasGhostVote: false }
        : player
    ))
    
    setShowStatusModal(false)
    setSelectedPlayer(null)
  }

  const handleToggleGhostVote = () => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, hasGhostVote: !player.hasGhostVote }
        : player
    ))
    
    setShowStatusModal(false)
    setSelectedPlayer(null)
  }

  const getFilteredCharacters = () => {
    if (!activeScript) return []
    
    let characters = []
    
    // Get all characters from the active script
    Object.values(activeScript.groups).flat().forEach(slug => {
      const character = characterDetails[slug]
      if (character) {
        characters.push({ ...character, slug })
      }
    })

    // Apply type filter
    if (filterType !== 'all') {
      characters = characters.filter(char => char.type === filterType)
    }

    // Apply search filter
    if (searchTerm) {
      characters = characters.filter(char => 
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.blurb.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return characters
  }

  const getPlayerPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start at 12 o'clock
    const radius = 200
    const centerX = 300
    const centerY = 300
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  if (isLoadingScript || isLoadingGrimoire) {
    return (
      <div className="grimoire">
        <div className="loading">Loading Grimoire...</div>
      </div>
    )
  }

  if (!activeScript) {
    return (
      <div className="grimoire">
        <div className="no-script">
          <h2>No Active Script</h2>
          <p>Please create a script first to use the Grimoire.</p>
        </div>
      </div>
    )
  }

  const filteredCharacters = getFilteredCharacters()

  return (
    <div className="grimoire">
      <div className="grimoire-header">
        <h1>Grimoire</h1>
        <p>Game Management for {activeScript.name}</p>
      </div>

      {players.length === 0 ? (
        <div className="setup-phase">
          <div className="setup-content">
            <h2>Set Up Players</h2>
            <p>Enter player names in order, starting from the 12 o'clock position (clockwise).</p>
            <p>You can add up to 20 players.</p>
            
            {!showPlayerInput ? (
              <button 
                className="start-game-btn"
                onClick={() => setShowPlayerInput(true)}
              >
                Start New Game
              </button>
            ) : (
              <div className="player-input-form">
                <textarea
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  placeholder="Enter player names, one per line:&#10;Player 1&#10;Player 2&#10;Player 3&#10;..."
                  className="player-names-input"
                  rows={10}
                />
                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowPlayerInput(false)
                      setPlayerNames('')
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="submit-btn"
                    onClick={handleAddPlayers}
                    disabled={!playerNames.trim()}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="game-phase">
          <div className="game-controls">
            <button 
              className="new-game-btn"
              onClick={handleNewGame}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'New Game'}
            </button>
            <div className="player-count">
              {players.length} Player{players.length !== 1 ? 's' : ''}
              {isSaving && <span className="saving-indicator"> • Saving...</span>}
            </div>
          </div>

          <div className="players-circle">
            <svg viewBox="0 0 600 600" className="circle-svg">
              {players.map((player, index) => {
                const position = getPlayerPosition(index, players.length)
                const character = player.character ? characterDetails[player.character] : null
                
                return (
                  <g key={player.id}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="40"
                      className={`player-circle ${player.character ? 'assigned' : 'empty'} ${player.isDead ? 'dead' : ''}`}
                      onClick={() => handlePlayerClick(player)}
                    />
                    {character && (
                      <image
                        x={position.x - 30}
                        y={position.y - 30}
                        width="60"
                        height="60"
                        href={character.image}
                        className={`character-icon ${player.isDead ? 'dead' : ''}`}
                        onClick={() => handlePlayerClick(player)}
                        title="Click to manage character"
                      />
                    )}
                    {player.isDead && (
                      <image
                        x={position.x - 30}
                        y={position.y - 58}
                        width="60"
                        height="60"
                        href="/assets/grim_tokens/deathshroud.png"
                        className="deathshroud-indicator"
                      />
                    )}
                    {player.hasGhostVote && (
                      <image
                        x={position.x - 30}
                        y={position.y - 90}
                        width="60"
                        height="60"
                        href="/assets/grim_tokens/ghostvote.png"
                        className="ghost-vote-indicator"
                      />
                    )}
                    <text
                      x={position.x}
                      y={position.y + 60}
                      className={`player-name ${player.isDead ? 'dead' : ''}`}
                      textAnchor="middle"
                    >
                      {player.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Character Selection Modal */}
      {showCharacterModal && (
        <div className="modal-overlay" onClick={() => setShowCharacterModal(false)}>
          <div className="character-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Character to {selectedPlayer?.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCharacterModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-controls">
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="townsfolk">Townsfolk</option>
                <option value="outsiders">Outsiders</option>
                <option value="minions">Minions</option>
                <option value="demons">Demons</option>
              </select>
            </div>
            
            <div className="character-grid">
              {filteredCharacters.map(character => (
                <div
                  key={character.slug}
                  className="character-option"
                  onClick={() => handleCharacterSelect(character.slug)}
                >
                  <img 
                    src={character.image} 
                    alt={character.name}
                    className="character-image"
                  />
                  <div className="character-info">
                    <h4 className="character-name">{character.name}</h4>
                    <span className={`character-type ${character.type}`}>
                      {character.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Character Status Modal */}
      {showStatusModal && selectedPlayer && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="character-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage {selectedPlayer.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="status-modal-content">
              <div className="character-info-display">
                {selectedPlayer.character && (
                  <>
                    <img 
                      src={characterDetails[selectedPlayer.character]?.image} 
                      alt={characterDetails[selectedPlayer.character]?.name}
                      className="status-character-image"
                    />
                    <div className="status-character-details">
                      <h4>{characterDetails[selectedPlayer.character]?.name}</h4>
                      <span className={`character-type ${characterDetails[selectedPlayer.character]?.type}`}>
                        {characterDetails[selectedPlayer.character]?.type?.toUpperCase()}
                      </span>
                      {selectedPlayer.isDead && (
                        <div className="status-indicators">
                          <span className="dead-status">☠ Dead</span>
                          {selectedPlayer.hasGhostVote && (
                            <span className="ghost-vote-status">👻 Has Ghost Vote</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="status-actions">
                {!selectedPlayer.isDead ? (
                  <>
                    <button 
                      className="status-btn danger-btn"
                      onClick={handleMarkDead}
                    >
                      Mark as Dead
                    </button>
                    <button 
                      className="status-btn secondary-btn"
                      onClick={handleUnassignCharacter}
                    >
                      Unassign Character
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="status-btn success-btn"
                      onClick={handleMarkAlive}
                    >
                      Mark as Alive
                    </button>
                    <button 
                      className={`status-btn ${selectedPlayer.hasGhostVote ? 'warning-btn' : 'info-btn'}`}
                      onClick={handleToggleGhostVote}
                    >
                      {selectedPlayer.hasGhostVote ? 'Remove Ghost Vote' : 'Add Ghost Vote'}
                    </button>
                    <button 
                      className="status-btn secondary-btn"
                      onClick={handleUnassignCharacter}
                    >
                      Unassign Character
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Grimoire
