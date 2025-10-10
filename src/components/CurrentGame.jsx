import { useState, useEffect } from 'react'
import { grimoireApi } from '../services/api'
import './CurrentGame.css'

// Character distribution function (copied from Grimoire component)
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

function CurrentGame() {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveGame, setHasActiveGame] = useState(false)

  // Check if there's an active game and fetch player data
  useEffect(() => {
    const checkActiveGame = async () => {
      try {
        const grimoireState = await grimoireApi.getGrimoire()
        
        if (grimoireState && grimoireState.players && grimoireState.players.length > 0) {
          // Only update if the data has actually changed
          setPlayers(prevPlayers => {
            const newPlayers = grimoireState.players
            if (JSON.stringify(prevPlayers) !== JSON.stringify(newPlayers)) {
              return newPlayers
            }
            return prevPlayers
          })
          setHasActiveGame(true)
        } else {
          setHasActiveGame(false)
          setPlayers([])
        }
      } catch (error) {
        console.error('Error checking active game:', error)
        setHasActiveGame(false)
        setPlayers([])
      } finally {
        setIsLoading(false)
      }
    }

    checkActiveGame()

    // Set up polling to check for updates every 5 seconds (reduced frequency)
    const interval = setInterval(checkActiveGame, 5000)

    return () => clearInterval(interval)
  }, [])

  // Calculate player positions in a circle
  const getPlayerPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start at 12 o'clock
    const radius = 350
    const centerX = 500
    const centerY = 500
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  if (isLoading) {
    return (
      <div className="current-game">
        <div className="loading">Loading Current Game...</div>
      </div>
    )
  }

  if (!hasActiveGame) {
    return (
      <div className="current-game">
        <div className="no-active-game">
          <h2>No Active Game</h2>
          <p>There is currently no active game in progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="current-game">
      <div className="game-header">
        <h2>Current Game</h2>
        <div className="player-count">
          {players.length} Player{players.length !== 1 ? 's' : ''}
        </div>
        <div className="player-distribution">
          <h3>Default Distribution for {players.length} Players:</h3>
          <div className="distribution-breakdown">
            {(() => {
              const distribution = getCharacterDistribution(players.length)
              return (
                <>
                  <span className="distribution-item townsfolk">
                    {distribution.townsfolk} Townsfolk
                  </span>
                  <span className="distribution-item outsiders">
                    {distribution.outsiders} Outsider{distribution.outsiders !== 1 ? 's' : ''}
                  </span>
                  <span className="distribution-item minions">
                    {distribution.minions} Minion{distribution.minions !== 1 ? 's' : ''}
                  </span>
                  <span className="distribution-item demons">
                    {distribution.demons} Demon{distribution.demons !== 1 ? 's' : ''}
                  </span>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      <div className="players-circle">
        {players.map((player, index) => {
          const position = getPlayerPosition(index, players.length)
          
          return (
            <div
              key={player.id}
              className="player-container"
              style={{
                left: position.x - 50,
                top: position.y - 50
              }}
            >
              <div className={`player-circle ${player.isDead ? 'dead' : 'alive'}`}>
                {/* Death shroud indicator */}
                {player.isDead && (
                  <div className="deathshroud-indicator">
                    💀
                  </div>
                )}
                
                {/* Ghost vote indicator */}
                {player.isDead && player.hasGhostVote && (
                  <div className="ghost-vote-indicator">
                    👻
                  </div>
                )}
                
                {/* About to die indicator */}
                {player.aboutToDie && !player.isDead && (
                  <div className="about-to-die-indicator">
                    💀
                  </div>
                )}
              </div>
              
              <div className="player-name">
                {player.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CurrentGame
