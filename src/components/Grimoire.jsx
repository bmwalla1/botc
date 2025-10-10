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
  const [showRandomizeModal, setShowRandomizeModal] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [demonBluffs, setDemonBluffs] = useState([])
  const [isAddingBluff, setIsAddingBluff] = useState(false)

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
        setDemonBluffs(grimoireState.demonBluffs || [])
        
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoadingScript(false)
        setIsLoadingGrimoire(false)
      }
    }
    
    loadData()
  }, [])

  // Save grimoire state whenever players or demon bluffs change
  useEffect(() => {
    if (!isLoadingGrimoire && (players.length > 0 || demonBluffs.length > 0)) {
      saveGrimoireState()
    }
  }, [players, demonBluffs, isLoadingGrimoire])

  const saveGrimoireState = async () => {
    try {
      setIsSaving(true)
      await grimoireApi.updateGrimoire(players, players.length > 0, demonBluffs)
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
      isAlignmentFlipped: false,
      aboutToDie: false
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
    if (isAddingBluff) {
      // Add as demon bluff
      const character = characterDetails[characterSlug]
      if (character) {
        addDemonBluff(character)
      }
      setShowCharacterModal(false)
      setIsAddingBluff(false)
    } else if (selectedPlayer) {
      // Assign to player
      setPlayers(prev => prev.map(player => 
        player.id === selectedPlayer.id 
          ? { ...player, character: characterSlug, isDead: false, hasGhostVote: false }
          : player
      ))
      
      setShowCharacterModal(false)
      setSelectedPlayer(null)
    }
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
    
    handlePlayerDeath(selectedPlayer.id)
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

  const getCharacterDistribution = (playerCount) => {
    const distributions = {
      5: { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 },
      6: { townsfolk: 3, outsiders: 1, minions: 1, demons: 1 },
      7: { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 },
      8: { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 },
      9: { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 },
      10: { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 },
      11: { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 },
      12: { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 },
      13: { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 },
      14: { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 }
    }
    
    // For 15+ players, use the same distribution as 15
    if (playerCount >= 15) {
      return { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 }
    }
    
    return distributions[playerCount] || { townsfolk: 0, outsiders: 0, minions: 0, demons: 0 }
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
      
      // Add outsider tokens if Hermit is in play (only for outsiders with reminder tokens)
      const hermitInPlay = players.some(player => player.character === 'hermit')
      if (hermitInPlay) {
        // Get all outsider characters from the script
        const outsiderSlugs = activeScript.groups.outsiders || []
        outsiderSlugs.forEach(slug => {
          const character = characterDetails[slug]
          if (character && character.reminderTokens && character.reminderTokens.length > 0) {
            character.reminderTokens.forEach(token => {
              if (!allTokens.includes(token)) {
                allTokens.push(token)
              }
            })
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

  const handleRandomizeRoles = () => {
    // Clear all assigned characters, alignments, and reminder tokens
    setPlayers(prev => prev.map(player => ({
      ...player,
      character: null,
      isAlignmentFlipped: false,
      reminderTokens: [],
      isDead: false,
      hasGhostVote: false
    })))
    
    setShowRandomizeModal(true)
  }

  const getRandomCharacters = (type, count) => {
    if (!activeScript) return []
    
    const availableCharacters = Object.values(activeScript.groups).flat()
      .filter(slug => characterDetails[slug]?.type === type)
      .map(slug => characterDetails[slug])
    
    // Shuffle and take the requested count
    const shuffled = [...availableCharacters].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const randomizeCharacterSelection = () => {
    const distribution = getCharacterDistribution(players.length)
    const randomRoles = []
    
    // Get random characters for each type
    randomRoles.push(...getRandomCharacters('townsfolk', distribution.townsfolk))
    randomRoles.push(...getRandomCharacters('outsiders', distribution.outsiders))
    randomRoles.push(...getRandomCharacters('minions', distribution.minions))
    randomRoles.push(...getRandomCharacters('demons', distribution.demons))
    
    setSelectedRoles(randomRoles)
  }

  const removeSelectedRole = (roleToRemove) => {
    setSelectedRoles(prev => prev.filter(role => role.id !== roleToRemove.id))
  }

  const addSelectedRole = (role) => {
    if (!selectedRoles.find(r => r.id === role.id)) {
      setSelectedRoles(prev => [...prev, role])
    }
  }

  const assignRolesToPlayers = () => {
    if (selectedRoles.length === 0) return
    
    // Shuffle the selected roles
    const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5)
    
    // Assign roles to the first N players where N is the number of selected roles
    setPlayers(prev => prev.map((player, index) => {
      if (index < shuffledRoles.length) {
        return {
          ...player,
          character: shuffledRoles[index].id
        }
      }
      return player
    }))
    
    setShowRandomizeModal(false)
    setSelectedRoles([])
  }

  const addDemonBluff = (character) => {
    if (demonBluffs.length < 3 && !demonBluffs.find(bluff => bluff.id === character.id)) {
      setDemonBluffs(prev => [...prev, character])
    }
  }

  const removeDemonBluff = (characterId) => {
    setDemonBluffs(prev => prev.filter(bluff => bluff.id !== characterId))
  }

  const toggleAboutToDie = (playerId) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          aboutToDie: !player.aboutToDie,
          // Remove about to die if player is already dead
          isDead: player.isDead ? player.isDead : false
        }
      }
      return player
    }))
  }

  const handlePlayerDeath = (playerId) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          isDead: true,
          hasGhostVote: true,
          aboutToDie: false // Remove about to die when player dies
        }
      }
      return player
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
            <button 
              className="randomize-roles-btn"
              onClick={handleRandomizeRoles}
              disabled={isSaving || players.length === 0}
            >
              Randomize Roles
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
                    {player.aboutToDie && !player.isDead && (
                      <div className="about-to-die-indicator">
                        💀
                      </div>
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

          {/* Demon Bluffs Section */}
          <div className="demon-bluffs-section">
            <h3>Demon Bluffs ({demonBluffs.length}/3)</h3>
            <div className="demon-bluffs-container">
              {demonBluffs.map((bluff, index) => (
                <div key={bluff.id} className="demon-bluff-item">
                  <img
                    src={bluff.image}
                    alt={bluff.name}
                    className="demon-bluff-image"
                  />
                  <div className="demon-bluff-info">
                    <span className="demon-bluff-name">{bluff.name}</span>
                    <button
                      className="remove-bluff-btn"
                      onClick={() => removeDemonBluff(bluff.id)}
                      title="Remove bluff"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {demonBluffs.length < 3 && (
                <div className="add-bluff-container">
                  <button
                    className="add-bluff-btn"
                    onClick={() => {
                      // Open character selection for demon bluffs
                      setIsAddingBluff(true)
                      setShowCharacterModal(true)
                    }}
                    title="Add demon bluff"
                  >
                    + Add Bluff
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Character Selection Modal */}
      {showCharacterModal && (
        <div className="modal-overlay" onClick={() => setShowCharacterModal(false)}>
          <div className="character-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isAddingBluff ? 'Add Demon Bluff' : `Assign Character to ${selectedPlayer?.name}`}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCharacterModal(false)
                  setIsAddingBluff(false)
                }}
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
                    <button 
                      className={`status-btn ${selectedPlayer.aboutToDie ? 'warning-btn' : 'info-btn'}`}
                      onClick={() => {
                        toggleAboutToDie(selectedPlayer.id)
                        setShowStatusModal(false)
                        setSelectedPlayer(null)
                      }}
                    >
                      {selectedPlayer.aboutToDie ? 'Remove About to Die' : 'Mark About to Die'}
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

      {/* Randomize Roles Modal */}
      {showRandomizeModal && (
        <div className="modal-overlay" onClick={() => setShowRandomizeModal(false)}>
          <div className="character-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Randomize Roles</h3>
              <button 
                className="close-btn"
                onClick={() => setShowRandomizeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="randomize-controls">
              <button 
                className="randomize-btn"
                onClick={randomizeCharacterSelection}
              >
                Randomize Selection
              </button>
              <div className="role-count">
                Selected: {selectedRoles.length} / {players.length} roles
              </div>
            </div>

            <div className="selected-roles-section">
              <h4>Selected Roles:</h4>
              <div className="selected-roles-grid">
                {selectedRoles.map((role, index) => (
                  <div
                    key={index}
                    className="selected-role-item"
                    onClick={() => removeSelectedRole(role)}
                  >
                    <img 
                      src={role.image} 
                      alt={role.name}
                      className="role-image"
                    />
                    <div className="role-info">
                      <h5 className="role-name">{role.name}</h5>
                      <span className={`role-type ${role.type}`}>
                        {role.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="available-roles-section">
              <h4>Available Roles:</h4>
              <div className="available-roles-grid">
                {getFilteredCharacters().map(character => (
                  <div
                    key={character.id}
                    className={`available-role-item ${selectedRoles.find(r => r.id === character.id) ? 'selected' : ''}`}
                    onClick={() => addSelectedRole(character)}
                  >
                    <img 
                      src={character.image} 
                      alt={character.name}
                      className="role-image"
                    />
                    <div className="role-info">
                      <h5 className="role-name">{character.name}</h5>
                      <span className={`role-type ${character.type}`}>
                        {character.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="assign-roles-btn"
                onClick={assignRolesToPlayers}
                disabled={selectedRoles.length === 0}
              >
                Assign Roles ({selectedRoles.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Grimoire
