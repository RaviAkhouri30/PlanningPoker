/**
 * The round countdown. `firestore.rules` mirrors the range and the default (a room created
 * before the countdown has no `timerSeconds` and counts down from the default).
 */
export const TIMER_LIMITS = {
  /** Where a new room's countdown starts. */
  defaultSeconds: 60,
  minSeconds: 30,
  maxSeconds: 600,
  /** The moderator's − and + buttons move the countdown by this much. */
  stepSeconds: 30,
  /** Everyone is warned when this many seconds are left. */
  warningSeconds: 20,
} as const;

/** Milliseconds in a second, for the countdown's arithmetic. */
export const MS_PER_SECOND = 1000;
