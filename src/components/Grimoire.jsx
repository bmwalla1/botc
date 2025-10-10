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
      hasGhostVote: false,
      reminderTokens: [],
      isAlignmentFlipped: false
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

  const getMaxReminderTokens = () => {
    return Math.max(...players.map(player => player.reminderTokens?.length || 0), 0)
  }

  const getPlayerPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start at 12 o'clock
    const maxTokens = getMaxReminderTokens()
    const tokenSpace = maxTokens * 30 // 30px per token for spacing
    
    // Scale radius based on number of players
    const minRadius = 150
    const maxRadius = 300
    const playerScaleFactor = Math.max(1, total / 7) // Scale factor based on 7 players as baseline
    const baseRadius = Math.min(maxRadius, minRadius + (total - 7) * 15)
    
    const radius = baseRadius + tokenSpace
    const centerX = 400
    const centerY = 400
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  const getAllReminderTokens = () => {
    const allTokens = []
    players.forEach(player => {
      if (player.character) {
        const character = characterDetails[player.character]
        if (character && character.reminderTokens) {
          character.reminderTokens.forEach(token => {
            if (!allTokens.includes(token)) {
              allTokens.push(token)
            }
          })
        }
      }
    })
    return allTokens
  }

  const getAvailableReminderTokens = () => {
    const allTokens = []
    
    // Get tokens from assigned characters
    players.forEach(player => {
      if (player.character) {
        const character = characterDetails[player.character]
        if (character && character.reminderTokens) {
          character.reminderTokens.forEach(token => {
            if (!allTokens.includes(token)) {
              allTokens.push(token)
            }
          })
        }
      }
    })
    
    // Add special global tokens based on script conditions
    if (activeScript) {
      // Always add Drunk token
      if (!allTokens.includes('drunk.png')) {
        allTokens.push('drunk.png')
      }
      
      // Add Marionette token if Marionette is in the script
      const hasMarionette = Object.values(activeScript.groups).flat().includes('marionette')
      if (hasMarionette && !allTokens.includes('marionette.png')) {
        allTokens.push('marionette.png')
      }
      
      // Add all outsider tokens if Hermit is in the script
      const hasHermit = Object.values(activeScript.groups).flat().includes('hermit')
      if (hasHermit) {
        const outsiderTokens = [
          'barber.png', 'butler.png', 'damsel.png', 'drunk.png', 'golem.png', 
          'goon.png', 'hatter.png', 'heretic.png', 'hermit.png', 'klutz.png', 
          'lunatic.png', 'moonchild.png', 'mutant.png', 'ogre.png', 'plaguedoctor.png', 
          'politician.png', 'puzzlemaster.png', 'recluse.png', 'saint.png', 
          'snitch.png', 'sweetheart.png', 'tinker.png', 'zealot.png'
        ]
        outsiderTokens.forEach(token => {
          if (!allTokens.includes(token)) {
            allTokens.push(token)
          }
        })
      }
    }
    
    return allTokens
  }

  const handleAddReminderToken = (token) => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, reminderTokens: [...(player.reminderTokens || []), token] }
        : player
    ))
    
    // Update selectedPlayer to reflect the change immediately
    setSelectedPlayer(prev => ({
      ...prev,
      reminderTokens: [...(prev.reminderTokens || []), token]
    }))
  }

  const handleRemoveReminderToken = (token, tokenIndex) => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { 
            ...player, 
            reminderTokens: player.reminderTokens.filter((_, index) => index !== tokenIndex)
          }
        : player
    ))
    
    // Update selectedPlayer to reflect the change immediately
    setSelectedPlayer(prev => ({
      ...prev,
      reminderTokens: prev.reminderTokens.filter((_, index) => index !== tokenIndex)
    }))
  }

  const handleRemoveCircleToken = (playerId, tokenIndex) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { 
            ...player, 
            reminderTokens: player.reminderTokens.filter((_, index) => index !== tokenIndex)
          }
        : player
    ))
  }

  const handleFlipAlignment = () => {
    if (!selectedPlayer) return
    
    setPlayers(prev => prev.map(player => 
      player.id === selectedPlayer.id 
        ? { ...player, isAlignmentFlipped: !player.isAlignmentFlipped }
        : player
    ))
    
    // Update selectedPlayer to reflect the change immediately
    setSelectedPlayer(prev => ({
      ...prev,
      isAlignmentFlipped: !prev.isAlignmentFlipped
    }))
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
            {players.map((player, index) => {
              const position = getPlayerPosition(index, players.length)
              const character = player.character ? characterDetails[player.character] : null
              
              return (
                <div key={player.id} className="player-container" style={{
                  left: position.x - 50,
                  top: position.y - 50
                }}>
                  <div
                    className={`player-circle ${player.character ? 'assigned' : 'empty'} ${player.isDead ? 'dead' : ''}`}
                    onClick={() => handlePlayerClick(player)}
                  >
                    {character && (
                      <img
                        src={character.image}
                        alt={character.name}
                        className={`character-icon ${player.isDead ? 'dead' : ''} ${player.isAlignmentFlipped ? 'flipped' : ''}`}
                        onClick={() => handlePlayerClick(player)}
                        title="Click to manage character"
                      />
                    )}
                    {player.isDead && (
                      <img
                        src="/assets/grim_tokens/deathshroud.png"
                        alt="Death shroud"
                        className="deathshroud-indicator"
                      />
                    )}
                    {player.hasGhostVote && (
                      <img
                        src="/assets/grim_tokens/ghostvote.png"
                        alt="Ghost vote"
                        className="ghost-vote-indicator"
                      />
                    )}
                  </div>
                  <div className={`player-name ${player.isDead ? 'dead' : ''}`}>
                    {player.name}
                  </div>
                  {player.reminderTokens && player.reminderTokens.length > 0 && (
                    <div className="player-reminder-tokens-circle">
                      {player.reminderTokens.map((token, tokenIndex) => {
                        // Calculate direction towards center
                        const centerX = 400
                        const centerY = 400
                        const dx = centerX - position.x
                        const dy = centerY - position.y
                        const distance = Math.sqrt(dx * dx + dy * dy)
                        const unitX = dx / distance
                        const unitY = dy / distance
                        
                        // Position tokens towards center, with entire stack pushed in
                        const tokenOffset = 100 + tokenIndex * 40
                        const tokenX = position.x + (unitX * tokenOffset)
                        const tokenY = position.y + (unitY * tokenOffset)
                        
                        return (
                          <img
                            key={tokenIndex}
                            src={`/assets/grim_tokens/${token}`}
                            alt={token.replace('.png', '').replace(/_/g, ' ')}
                            className="circle-reminder-token"
                            title={`Click to remove ${token.replace('.png', '').replace(/_/g, ' ')}`}
                            style={{
                              left: tokenX - position.x - 35,
                              top: tokenY - position.y - 35 - 60
                            }}
                            onClick={() => handleRemoveCircleToken(player.id, tokenIndex)}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
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
                      {(selectedPlayer.reminderTokens && selectedPlayer.reminderTokens.length > 0) && (
                        <div className="player-reminder-tokens">
                          <h5>Assigned Reminder Tokens:</h5>
                          <div className="player-tokens-row">
                            {selectedPlayer.reminderTokens.map((token, index) => (
                              <div key={index} className="player-token-item">
                                <img
                                  src={`/assets/grim_tokens/${token}`}
                                  alt={token.replace('.png', '').replace(/_/g, ' ')}
                                  className="player-reminder-token"
                                  title={token.replace('.png', '').replace(/_/g, ' ')}
                                />
                                <button
                                  className="remove-token-btn"
                                  onClick={() => handleRemoveReminderToken(token, index)}
                                  title="Remove token"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
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
                    <button 
                      className={`status-btn ${selectedPlayer.isAlignmentFlipped ? 'warning-btn' : 'info-btn'}`}
                      onClick={handleFlipAlignment}
                    >
                      {'Toggle Alignment'}
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
                    <button 
                      className={`status-btn ${selectedPlayer.isAlignmentFlipped ? 'warning-btn' : 'info-btn'}`}
                      onClick={handleFlipAlignment}
                    >
                      {'Toggle Alignment'}
                    </button>
                  </>
                )}
              </div>

              {getAvailableReminderTokens().length > 0 && (
                <div className="add-reminder-tokens">
                  <h5>Add Reminder Token:</h5>
                  <div className="available-tokens-row">
                    {getAvailableReminderTokens().map((token, index) => (
                      <img
                        key={index}
                        src={`/assets/grim_tokens/${token}`}
                        alt={token.replace('.png', '').replace(/_/g, ' ')}
                        className="available-reminder-token"
                        title={`Add ${token.replace('.png', '').replace(/_/g, ' ')}`}
                        onClick={() => handleAddReminderToken(token)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Grimoire
