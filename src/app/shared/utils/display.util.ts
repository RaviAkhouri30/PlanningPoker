import { MS_PER_SECOND } from '@shared/constants/timer.constants';
/** Seconds in a minute, and the width of each clock part. */
const SECONDS_PER_MINUTE = 60;
const CLOCK_DIGITS = 2;

/** Most initials an avatar shows. */
const MAX_INITIALS = 2;

/**
 * @param name A display name.
 * @returns Up to two initials, upper case; `?` for an empty name.
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  return words
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * @param name A display name.
 * @returns Its first word, e.g. for "Join as Alex".
 */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

/**
 * @param elapsedMs Time since the round started.
 * @returns `mm:ss`, never negative.
 */
export function formatClock(elapsedMs: number): string {
  const seconds = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const pad = (value: number): string => String(value).padStart(CLOCK_DIGITS, '0');
  return `${pad(minutes)}:${pad(seconds % SECONDS_PER_MINUTE)}`;
}
