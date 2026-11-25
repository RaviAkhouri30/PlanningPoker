/** Letters and digits for codes and ids: no 0/O, 1/I/L, so a code read aloud is unambiguous. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** A code is four characters, a dash, then two more: `X7K2-92`. */
export const CODE_HEAD_LENGTH = 4;
export const CODE_TAIL_LENGTH = 2;

/** Random characters after a room's slug: 31^6, about 887 million rooms per name. */
export const ROOM_ID_SUFFIX_LENGTH = 6;

/** Characters of the room name kept in its id. */
export const ROOM_SLUG_MAX_LENGTH = 32;

/** The id slug when a room has no usable name. */
export const FALLBACK_ROOM_SLUG = 'room';

/** The name of a room created without one. */
export const DEFAULT_ROOM_NAME = 'Planning poker';

/** Cards flip this long after the last player votes, so the last card is seen landing. */
export const AUTO_REVEAL_DELAY_MS = 700;

/** How often an open room tells the others you're still there. */
export const HEARTBEAT_INTERVAL_MS = 30_000;

/** Someone counts as online when seen within this window (two missed heartbeats and a margin). */
export const ONLINE_WINDOW_MS = 75_000;

/**
 * Retries for reading a revealed round's cards. The moderator's own tab sees its flip before the
 * server has stored it, so its first read can be refused (ADR-0008); the server catches up fast.
 */
export const ROUND_VOTES_RETRIES = 5;

/** Wait between those retries. */
export const ROUND_VOTES_RETRY_MS = 400;

/** How often the round timer redraws. */
export const TIMER_TICK_MS = 1000;

/** Attempts at creating a room before giving up, in case a random code is already taken. */
export const ROOM_CREATE_ATTEMPTS = 3;

/**
 * A new seat is announced only when it was taken within this window, so a listener that fills in
 * late (cache first, then the server) never announces people who were already there.
 */
export const JOIN_NOTICE_WINDOW_MS = 60_000;
