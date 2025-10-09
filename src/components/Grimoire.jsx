import { useState, useEffect } from 'react'
import { characterDetails } from '../data/characters'
import './Grimoire.css'

function Grimoire() {
  const [activeScript, setActiveScript] = useState(null)
  const [isLoadingScript, setIsLoadingScript] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    const loadActiveScript = async () => {
      try {
        setIsLoadingScript(true)
        const { getActiveScript } = await import('../data/scripts')
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

  const handleCharacterClick = (characterSlug) => {
    setSelectedCharacter(characterSlug)
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

  if (isLoadingScript) {
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
          <p>Please create a script first to view the Grimoire.</p>
        </div>
      </div>
    )
  }

  const filteredCharacters = getFilteredCharacters()
  const selectedChar = selectedCharacter ? characterDetails[selectedCharacter] : null

  return (
    <div className="grimoire">
      <div className="grimoire-header">
        <h1>Grimoire</h1>
        <p>Storyteller's reference for {activeScript.name}</p>
      </div>

      <div className="grimoire-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
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
      </div>

      <div className="grimoire-content">
        <div className="character-list">
          <h3>Characters in Script ({filteredCharacters.length})</h3>
          <div className="character-grid">
            {filteredCharacters.map(character => (
              <div
                key={character.slug}
                className={`character-card ${selectedCharacter === character.slug ? 'selected' : ''}`}
                onClick={() => handleCharacterClick(character.slug)}
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

        <div className="character-details">
          {selectedChar ? (
            <div className="character-detail-card">
              <div className="character-detail-header">
                <img 
                  src={selectedChar.image} 
                  alt={selectedChar.name}
                  className="detail-image"
                />
                <div className="detail-info">
                  <h2>{selectedChar.name}</h2>
                  <span className={`detail-type ${selectedChar.type}`}>
                    {selectedChar.type.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="character-description">
                <h3>Description</h3>
                <p>{selectedChar.description}</p>
              </div>

              {selectedChar.ability && (
                <div className="character-ability">
                  <h3>Ability</h3>
                  <p>{selectedChar.ability}</p>
                </div>
              )}

              {selectedChar.jinxes && selectedChar.jinxes.length > 0 && (
                <div className="character-jinxes">
                  <h3>Jinxes</h3>
                  {selectedChar.jinxes.map((jinx, index) => {
                    const jinxCharacter = characterDetails[jinx.character]
                    return (
                      <div key={index} className="jinx-item">
                        <strong>{jinxCharacter?.name}:</strong> {jinx.description}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="character-actions">
                <a 
                  href={selectedChar.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wiki-link"
                >
                  View on Wiki
                </a>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a character to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Grimoire
