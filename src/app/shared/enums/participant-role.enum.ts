/** How someone takes part in a room; stored in `participants.role`. */
export enum ParticipantRole {
  /** Votes on every story. */
  Player = 'player',
  /** Watches without a card in hand. */
  Spectator = 'spectator',
}
