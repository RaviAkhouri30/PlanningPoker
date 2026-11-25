/** Where the round countdown stands, for its colour in the top bar. */
export enum TimerPhase {
  /** No story being voted on, or the cards are face up. */
  Idle = 'idle',
  Running = 'running',
  /** The warning time or less is left. */
  Warning = 'warning',
  /** It reached zero. */
  Up = 'up',
}
