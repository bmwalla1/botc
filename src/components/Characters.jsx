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
                <div key={character} className="character-card">
                  {imageSrc && (
                    <img 
                      src={imageSrc} 
                      alt={formatCharacterName(character)}
                      className="character-image"
                    />
                  )}
                  <p className="character-name">{formatCharacterName(character)}</p>
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
