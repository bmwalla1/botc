import { useState, useMemo } from 'react'
import './Characters.css'
import { characterGroups, characterDetails } from '../data/characters'

// Function to convert slug to proper character display name
function formatCharacterName(slug) {
  // Explicit overrides for multi-word and punctuated names
  const displayNameOverrides = {
    // Townsfolk
    bountyhunter: 'Bounty Hunter',
    cultleader: 'Cult Leader',
    fortuneteller: 'Fortune Teller',
    highpriestess: 'High Priestess',
    poppygrower: 'Poppy Grower',
    snakecharmer: 'Snake Charmer',
    tealady: 'Tea Lady',
    towncrier: 'Town Crier',
    villageidiot: 'Village Idiot',
    // Outsiders
    plaguedoctor: 'Plague Doctor',
    // Minions
    devilsadvocate: "Devil's Advocate",
    eviltwin: 'Evil Twin',
    organgrinder: 'Organ Grinder',
    pithag: 'Pit-Hag',
    scarletwoman: 'Scarlet Woman',
    // Demons
    alhadikhia: 'Al-Hadikhia',
    fanggu: 'Fang Gu',
    lilmonsta: "Lil' Monsta",
    lordoftyphon: 'Lord of Typhon',
    nodashii: 'No Dashii'
  }

  if (displayNameOverrides[slug]) {
    return displayNameOverrides[slug]
  }

  // Fallback: replace underscores with spaces and capitalize first letter only
  const withSpaces = slug.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

// Function to get character image path
function getCharacterImage(type, character) {
  return characterDetails[character]?.image
}

// Function to format character name for wiki URL
function formatCharacterNameForWiki(slug) {
  const displayName = formatCharacterName(slug)

  // URL overrides for names with punctuation or specific casing rules
  const urlOverrides = {
    "Devil's Advocate": "Devil's_Advocate",
    'Pit-Hag': 'Pit-Hag',
    'Al-Hadikhia': 'Al-Hadikhia',
    "Lil' Monsta": "Lil'_Monsta",
    'Lord of Typhon': 'Lord_of_Typhon'
  }

  if (urlOverrides[displayName]) {
    return urlOverrides[displayName]
  }

  // Default: underscore-separated version of the display name
  return displayName.replace(/\s+/g, '_')
}

// Function to get wiki URL for a character
function getWikiUrl(character) {
  return characterDetails[character]?.url
}

// Function to handle character card click
function handleCharacterClick(character) {
  const wikiUrl = getWikiUrl(character)
  window.open(wikiUrl, '_blank', 'noopener,noreferrer')
}

function Characters() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const entries = useMemo(() => Object.entries(characterGroups), [])
  return (
    <div className="characters-page">
      <h1>Blood on the Clocktower Characters</h1>
      <div className="characters-search">
        <input
          type="text"
          className="characters-search-input"
          placeholder="Search characters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {entries.map(([type, characters]) => {
        const filtered = normalizedQuery
          ? characters.filter(c => formatCharacterName(c).toLowerCase().includes(normalizedQuery))
          : characters
        if (filtered.length === 0) return null
        return (
        <div key={type} className="character-section">
          <h2 className="section-title">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <div className="character-grid">
            {filtered.map(character => {
              const imageSrc = getCharacterImage(type, character)
              return (
                <div 
                  key={character} 
                  className="character-card clickable"
                  onClick={() => handleCharacterClick(character)}
                  title={`Click to view ${formatCharacterName(character)} on the Blood on the Clocktower Wiki`}
                >
                  {imageSrc && (
                    <img 
                      src={imageSrc} 
                      alt={formatCharacterName(character)}
                      className="character-image"
                    />
                  )}
                  <p className="character-name">{formatCharacterName(character)}</p>
                  <p className="character-blurb">{characterDetails[character]?.blurb || ''}</p>
                  <div className="wiki-link-indicator">
                    <span>📖</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )
      })}
    </div>
  )
}

export default Characters
