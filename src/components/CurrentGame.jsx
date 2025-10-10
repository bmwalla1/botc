import { useState, useEffect } from 'react'
import { grimoireApi } from '../services/api'
import './CurrentGame.css'

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
    const radius = 200
    const centerX = 400
    const centerY = 400
    
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
