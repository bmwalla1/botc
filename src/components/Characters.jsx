import './Characters.css'

// Character data organized by type
const characterData = {
  townsfolk: [
    'acrobat', 'alchemist', 'alsaahir', 'amnesiac', 'artist', 'atheist', 'balloonist', 'banshee',
    'bountyhunter', 'cannibal', 'chambermaid', 'chef', 'choirboy', 'clockmaker', 'courtier',
    'cultleader', 'dreamer', 'empath', 'engineer', 'exorcist', 'farmer', 'fisherman', 'flowergirl',
    'fool', 'fortuneteller', 'gambler', 'general', 'gossip', 'grandmother', 'highpriestess',
    'huntsman', 'innkeeper', 'investigator', 'juggler', 'king', 'knight', 'librarian', 'lycanthrope',
    'magician', 'mathematician', 'mayor', 'minstrel', 'monk', 'nightwatchman', 'noble', 'oracle',
    'pacifist', 'philosopher', 'pixie', 'poppygrower', 'preacher', 'princess', 'professor',
    'ravenkeeper', 'sage', 'sailor', 'savant', 'seamstress', 'shugenja', 'slayer', 'snakecharmer',
    'soldier', 'steward', 'tealady', 'towncrier', 'undertaker', 'villageidiot', 'virgin', 'washerwoman'
  ],
  outsiders: [
    'barber', 'butler', 'damsel', 'drunk', 'golem', 'goon', 'hatter', 'heretic', 'hermit',
    'klutz', 'lunatic', 'moonchild', 'mutant', 'ogre', 'plaguedoctor', 'politician', 'puzzlemaster',
    'recluse', 'saint', 'snitch', 'sweetheart', 'tinker', 'zealot'
  ],
  minions: [
    'assassin', 'baron', 'boffin', 'boomdandy', 'cerenovus', 'devilsadvocate', 'eviltwin',
    'fearmonger', 'goblin', 'godfather', 'harpy', 'marionette', 'mastermind', 'mezepheles',
    'organgrinder', 'pithag', 'poisoner', 'psychopath', 'scarletwoman', 'spy', 'summoner',
    'vizier', 'widow', 'witch', 'wizard', 'wraith', 'xaan'
  ],
  demons: [
    'alhadikhia', 'fanggu', 'imp', 'kazali', 'legion', 'leviathan', 'lilmonsta', 'lleech',
    'lordoftyphon', 'nodashii', 'ojo', 'po', 'pukka', 'riot', 'shabaloth', 'vigormortis',
    'vortox', 'yaggababble', 'zombuul'
  ]
}

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
  // Use a simple URL approach that works with Vite
  return `/src/assets/${type}/Icon_${character}.png`
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
  const wikiName = formatCharacterNameForWiki(character)
  return `https://wiki.bloodontheclocktower.com/${wikiName}`
}

// Function to handle character card click
function handleCharacterClick(character) {
  const wikiUrl = getWikiUrl(character)
  window.open(wikiUrl, '_blank', 'noopener,noreferrer')
}

function Characters() {
  return (
    <div className="characters-page">
      <h1>Blood on the Clocktower Characters</h1>
      
      {Object.entries(characterData).map(([type, characters]) => (
        <div key={type} className="character-section">
          <h2 className="section-title">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <div className="character-grid">
            {characters.map(character => {
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
                  <div className="wiki-link-indicator">
                    <span>📖</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Characters
