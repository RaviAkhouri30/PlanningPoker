/** Text the room page shows. */
export const ROOM_MESSAGES = {
  actionFailed: 'That didn’t go through. Check your connection and try again.',
  linkCopied: 'Link copied. Paste it in your team chat.',
  copyFailed: 'Could not copy. Select the link and copy it by hand.',
  waiting: 'Waiting for votes',
  everyone: 'Everyone has voted',
  autoOn: 'Cards flip automatically when everyone has voted',
  autoOff: 'Auto-reveal is off. Flip when you are ready.',
  waitingModerator: 'The moderator flips the cards',
  pickCard: 'Pick your card',
  voteIn: 'Your vote is in. Tap it again to take it back.',
  revealed: 'Cards are revealed',
  addStory: 'Add a story to start voting',
  addFirstStory: 'Add a story',
  addAnotherStory: 'Add another story',
  spectating: 'You are watching as a spectator',
  thinking: 'Thinking…',
  ready: 'Ready',
  voted: 'Voted',
  noVote: 'No vote',
  watching: 'Watching',
  moderator: 'Moderator',
  player: 'Player',
  spectator: 'Spectator',
} as const;

/** Stagger between seats when the cards flip, in ms. */
export const FLIP_STAGGER_MS = 110;
