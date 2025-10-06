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

// Function to convert filename to proper character name
function formatCharacterName(filename) {
  return filename
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Function to get character image path
function getCharacterImage(type, character) {
  // Use a simple URL approach that works with Vite
  return `/src/assets/${type}/Icon_${character}.png`
}

// Function to format character name for wiki URL
function formatCharacterNameForWiki(filename) {
  // Convert to proper case and handle special cases
  const formatted = filename
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Handle special cases that don't match the wiki URL format
  const specialCases = {
    'High Priestess': 'High_Priestess',
    'Devils Advocate': 'Devils_Advocate',
    'Evil Twin': 'Evil_Twin',
    'Scarlet Woman': 'Scarlet_Woman',
    'Lord Of Typhon': 'Lord_of_Typhon',
    'Plague Doctor': 'Plaguedoctor',
    'Puzzle Master': 'Puzzlemaster',
    'Village Idiot': 'Village_Idiot',
    'Tea Lady': 'Tea_Lady',
    'Town Crier': 'Town_Crier',
    'Snake Charmer': 'Snake_Charmer',
    'Poppy Grower': 'Poppy_Grower',
    'High Priestess': 'High_Priestess'
  }
  
  return specialCases[formatted] || formatted.replace(/\s+/g, '_')
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
