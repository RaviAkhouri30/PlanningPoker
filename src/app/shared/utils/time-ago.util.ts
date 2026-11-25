/** Each unit's length in ms. */
const UNIT_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
} as const;

/** Largest unit first: the first one that fits names the gap. */
const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['week', UNIT_MS.week],
  ['day', UNIT_MS.day],
  ['hour', UNIT_MS.hour],
  ['minute', UNIT_MS.minute],
];

const FORMAT = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * @param then A past moment, in ms since the epoch.
 * @param now The current moment (from `CLOCK`).
 * @returns e.g. "just now", "5 minutes ago", "yesterday", "3 weeks ago".
 */
export function timeAgo(then: number, now: number): string {
  const gap = Math.max(0, now - then);
  const unit = UNITS.find(([, size]) => gap >= size);
  return unit === undefined ? 'just now' : FORMAT.format(-Math.floor(gap / unit[1]), unit[0]);
}
