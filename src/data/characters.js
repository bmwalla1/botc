// Centralized character data: enum-like ids, groupings, and details

// Groupings of character slugs by type (folders match these names)
export const characterGroups = {
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

// Enum-like collection of character ids (slugs)
export const CHARACTERS = Object.freeze(
  Object.fromEntries(
    Object.values(characterGroups)
      .flat()
      .map(slug => [slug.toUpperCase(), slug])
  )
)

// Name formatting with overrides for multi-word/punctuated names
function formatCharacterName(slug) {
  const overrides = {
    bountyhunter: 'Bounty Hunter',
    cultleader: 'Cult Leader',
    fortuneteller: 'Fortune Teller',
    highpriestess: 'High Priestess',
    poppygrower: 'Poppy Grower',
    snakecharmer: 'Snake Charmer',
    tealady: 'Tea Lady',
    towncrier: 'Town Crier',
    villageidiot: 'Village Idiot',
    plaguedoctor: 'Plague Doctor',
    devilsadvocate: "Devil's Advocate",
    eviltwin: 'Evil Twin',
    organgrinder: 'Organ Grinder',
    pithag: 'Pit-Hag',
    scarletwoman: 'Scarlet Woman',
    alhadikhia: 'Al-Hadikhia',
    fanggu: 'Fang Gu',
    lilmonsta: "Lil' Monsta",
    lordoftyphon: 'Lord of Typhon',
    nodashii: 'No Dashii'
  }
  if (overrides[slug]) return overrides[slug]
  const withSpaces = slug.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

// Wiki url formatting
function formatCharacterNameForWiki(slug) {
  const name = formatCharacterName(slug)
  const urlOverrides = {
    "Devil's Advocate": "Devil's_Advocate",
    'Pit-Hag': 'Pit-Hag',
    'Al-Hadikhia': 'Al-Hadikhia',
    "Lil' Monsta": "Lil'_Monsta",
    'Lord of Typhon': 'Lord_of_Typhon'
  }
  if (urlOverrides[name]) return urlOverrides[name]
  return name.replace(/\s+/g, '_')
}

function getImagePath(type, slug) {
  return `/src/assets/${type}/Icon_${slug}.png`
}

// Blurbs per character (restored from your previous entries)
const blurbs = {
  // Townsfolk
  acrobat: 'Each night*, choose a player: if they are or become drunk or poisoned tonight, you die.',
  alchemist: 'You have a Minion ability. When using this, the Storyteller may prompt you to choose differently.',
  alsaahir: 'Each day, if you publicly guess which players are Minion(s) and which are Demon(s), good wins.',
  amnesiac: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.',
  artist: 'Once per game, during the day, privately ask the Storyteller any yes/no question.',
  atheist: 'The Storyteller can break the game rules, and if executed, good wins, even if you are dead. [No evil characters]',
  balloonist: 'Each night, you learn a player of a different character type than last night. [+0 or +1 Outsider',
  banshee: 'If the Demon kills you, all players learn this. From now on, you may nominate twice per day and vote twice per nomination.',
  bountyhunter: 'You start knowing 1 evil player. If the player you know dies, you learn another evil player tonight. [1 Townsfolk is evil]',
  cannibal: 'You have the ability of the recently killed executee. If they are evil, you are poisoned until a good player dies by execution.',
  chambermaid: 'Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.',
  chef: 'You start knowing how many pairs of evil players there are.',
  choirboy: 'If the Demon kills the King, you learn which player is the Demon. [+the King]',
  clockmaker: 'You start knowing how many steps from the Demon to its nearest Minion.',
  courtier: 'Once per game, at night, choose a character: they are drunk for 3 nights & 3 days.',
  cultleader: 'Each night, you become the alignment of an alive neighbor. If all good players choose to join your cult, your team wins.',
  dreamer: 'Each night, choose a player (not yourself or Travellers): you learn 1 good & 1 evil character, 1 of which is correct.',
  empath: 'Each night, you learn how many of your 2 alive neighbors are evil.',
  engineer: 'Once per game, at night, choose which Minions or which Demon is in play.',
  exorcist: 'Each night*, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn\'t wake tonight.',
  farmer: 'When you die at night, an alive good player becomes a Farmer.',
  fisherman: 'Once per game, during the day, visit the Storyteller for some advice to help your team win.',
  flowergirl: 'Each night*, you learn if a Demon voted today.',
  fool: 'The 1st time you die, you don\'t.',
  fortuneteller: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.',
  gambler: 'Each night*, choose a player & guess their character: if you guess wrong, you die.',
  general: 'Each night, you learn which alignment the Storyteller believes is winning: good, evil, or neither.',
  gossip: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.',
  grandmother: 'You start knowing a good player & their character. If the Demon kills them, you die too.',
  highpriestess: 'Each night, learn which player the Storyteller believes you should talk to most.',
  huntsman: 'Once per game, at night, choose a living player: the Damsel, if chosen, becomes a not-in-play Townsfolk. [+the Damsel]',
  innkeeper: 'Each night*, choose 2 players: they can\'t die tonight, but 1 is drunk until dusk.',
  investigator: 'You start knowing that 1 of 2 players is a particular Minion.',
  juggler: 'On your 1st day, publicly guess up to 5 players\' characters. That night, you learn how many you got correct.',
  king: 'Each night, if the dead equal or outnumber the living, you learn 1 alive character. The Demon knows you are the King.',
  knight: 'You start knowing 2 players that are not the Demon.',
  librarian: 'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)',
  lycanthrope: 'Each night*, choose an alive player. If good, they die & the Demon doesn\'t kill tonight. One good player registers as evil.',
  magician: 'The Demon thinks you are a Minion. Minions think you are a Demon.',
  mathematician: 'Each night, you learn how many players\' abilities worked abnormally (since dawn) due to another character\'s ability.',
  mayor: 'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.',
  minstrel: 'When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.',
  monk: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.',
  nightwatchman: 'Once per game, at night, choose a player: they learn you are the Nightwatchman.',
  noble: 'You start knowing 3 players, 1 and only 1 of which is evil.',
  oracle: 'Each night*, you learn how many dead players are evil.',
  pacifist: 'Executed good players might not die.',
  philosopher: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.',
  pixie: 'You start knowing 1 in-play Townsfolk. If you were mad that you were this character, you gain their ability when they die.',
  poppygrower: 'Minions & Demons do not know each other. If you die, they learn who each other are that night.',
  preacher: 'Each night, choose a player: a Minion, if chosen, learns this. All chosen Minions have no ability.',
  princess: 'On your 1st day, if you nominated & executed a player, the Demon doesn’t kill tonight.',
  professor: 'Once per game, at night*, choose a dead player: if they are a Townsfolk, they are resurrected.',
  ravenkeeper: 'If you die at night, you are woken to choose a player: you learn their character.',
  sage: 'If the Demon kills you, you learn that it is 1 of 2 players.',
  sailor: 'Each night, choose an alive player: either you or they are drunk until dusk. You can\'t die.',
  savant: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.',
  seamstress: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.',
  shugenja: 'You start knowing if your closest evil player is clockwise or anti-clockwise. If equidistant, this info is arbitrary.',
  slayer: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
  snakecharmer: 'Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.',
  soldier: 'You are safe from the Demon.',
  steward: 'You start knowing 1 good player.',
  tealady: 'If both your alive neighbors are good, they can\'t die.',
  towncrier: 'Each night*, you learn if a Minion nominated today.',
  undertaker: 'Each night*, you learn which character died by execution today.',
  villageidiot: 'Each night, choose a player: you learn their alignment. [+0 to +2 Village Idiots. 1 of the extras is drunk]',
  virgin: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
  washerwoman: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
  // Outsiders
  barber: 'If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.',
  butler: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.',
  damsel: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.',
  drunk: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.',
  golem: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.',
  goon: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.',
  hatter: 'If you died today or tonight, the Minion & Demon players may choose new Minion & Demon characters to be.',
  heretic: 'Whoever wins, loses & whoever loses, wins, even if you are dead.',
  hermit: 'You have all Outsider abilities. [-0 or -1 Outsider]',
  klutz: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.',
  lunatic: 'You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.',
  moonchild: 'When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.',
  mutant: 'If you are "mad" about being an Outsider, you might be executed.',
  ogre: 'On your 1st night, choose a player (not yourself): you become their alignment (you don\'t know which) even if drunk or poisoned.',
  plaguedoctor: 'When you die, the Storyteller gains a Minion ability.',
  politician: 'If you were the player most responsible for your team losing, you change alignment & win, even if dead.',
  puzzlemaster: '1 player is drunk, even if you die. If you guess (once) who it is, learn the Demon player, but guess wrong & get false info.',
  recluse: 'You might register as evil & as a Minion or Demon, even if dead.',
  saint: 'If you die by execution, your team loses.',
  snitch: 'Each Minion gets 3 bluffs.',
  sweetheart: 'When you die, 1 player is drunk from now on.',
  tinker: 'You might die at any time.',
  zealot: 'If there are 5 or more players alive, you must vote for every nomination.',
  // Minions
  assassin: 'Once per game, at night*, choose a player: they die, even if for some reason they could not.',
  baron: 'There are extra Outsiders in play. [+2 Outsiders]',
  boffin: 'The Demon (even if drunk or poisoned) has a not-in-play good character\'s ability. You both know which.',
  boomdandy: 'If you are executed, all but 3 players die. After a 10 to 1 countdown, the player with the most players pointing at them, dies.',
  cerenovus: 'Each night, choose a player & a good character: they are "mad" they are this character tomorrow, or might be executed."',
  devilsadvocate: 'Each night, choose a living player (different to last night): if executed tomorrow, they don\'t die.',
  eviltwin: 'You & an opposing player know each other. If the good player is executed, evil wins. Good can\'t win if you both live.',
  fearmonger: 'Each night, choose a player: if you nominate & execute them, their team loses. All players know if you choose a new player.',
  goblin: 'If you publicly claim to be the Goblin when nominated & are executed that day, your team wins.',
  godfather: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]',
  harpy: 'Each night, choose 2 players: tomorrow, the 1st player is mad that the 2nd is evil, or one or both might die.',
  marionette: 'You think you are a good character, but you are not. The Demon knows who you are. [You neighbor the Demon]',
  mastermind: 'If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.',
  mezepheles: 'You start knowing a secret word. The 1st good player to say this word becomes evil that night.',
  organgrinder: 'All players keep their eyes closed when voting and the vote tally is secret. Each night, choose if you are drunk until dusk.',
  pithag: 'Each night*, choose a player & a character they become (if not in play). If a Demon is made, deaths tonight are arbitrary.',
  poisoner: 'Each night, choose a player: they are poisoned tonight and tomorrow day.',
  psychopath: 'Each day, before nominations, you may publicly choose a player: they die. If executed, you only die if you lose roshambo.',
  scarletwoman: 'If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don\'t count.)',
  spy: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.',
  summoner: 'You get 3 bluffs. On the 3rd night, choose a player: they become an evil Demon of your choice. [No Demon]',
  vizier: 'All players know you are the Vizier. You cannot die during the day. If good voted, you may choose to execute immediately.',
  widow: 'On your 1st night, look at the Grimoire & choose a player: they are poisoned. 1 good player knows a Widow is in play.',
  witch: 'Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.',
  wizard: 'Once per game, choose to make a wish. If granted, it might have a price & leave a clue as to its nature.',
  wraith: 'You may choose to open your eyes at night. You wake when other evil players do.',
  xaan: 'On night X, all Townsfolk are poisoned until dusk. [X Outsiders]',
  // Demons
  alhadikhia: 'Each night*, you may choose 3 players (all players learn who): each silently chooses to live or die, but if all live, all die.',
  fanggu: 'Each night*, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]"',
  imp: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.',
  kazali: 'Each night*, choose a player: they die. [You choose which players are which Minions. -? to +? Outsiders]',
  legion: 'Each night*, a player might die. Executions fail if only evil voted. You register as a Minion too. [Most players are Legion]',
  leviathan: 'If more than 1 good player is executed, evil wins. All players know you are in play. After day 5, evil wins.',
  lilmonsta: 'Each night, Minions choose who babysits Lil\' Monsta & "is the Demon". Each night*, a player might die. [+1 Minion]',
  lleech: 'Each night*, choose a player: they die. You start by choosing a player: they are poisoned. You die if & only if they are dead.',
  lordoftyphon: 'Each night*, choose a player: they die. [Evil characters are in a line. You are in the middle. +1 Minion. -? to +? Outsiders]',
  nodashii: 'Each night*, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.',
  ojo: 'Each night*, choose a character: they die. If they are not in play, the Storyteller chooses who dies.',
  po: 'Each night*, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.',
  pukka: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.',
  riot: 'On day 3, Minions become Riot & nominees die but nominate an alive player immediately. This must happen.',
  shabaloth: 'Each night*, choose 2 players: they die. A dead player you chose last night might be regurgitated."',
  vigormortis: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]',
  vortox: 'Each night*, choose a player: they die. Townsfolk abilities yield false info. Each day, if no-one is executed, evil wins.',
  yaggababble: 'You start knowing a secret phrase. For each time you said it publicly today, a player might die."',
  zombuul: 'Each night*, if no-one died today, choose a player: they die. The 1st time you die, you live but register as dead.'
}

// Build details per character
export const characterDetails = Object.freeze(
  Object.entries(characterGroups).reduce((acc, [type, slugs]) => {
    slugs.forEach(slug => {
      acc[slug] = {
        id: slug,
        type,
        name: formatCharacterName(slug),
        image: getImagePath(type, slug),
        url: `https://wiki.bloodontheclocktower.com/${formatCharacterNameForWiki(slug)}`,
        blurb: blurbs[slug] || ''
      }
    })
    return acc
  }, {})
)


