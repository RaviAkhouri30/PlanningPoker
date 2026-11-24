/** The current time, injectable so tests control it (`CLOCK`). */
export interface IClock {
  /** @returns Milliseconds since the Unix epoch. */
  now(): number;
}
