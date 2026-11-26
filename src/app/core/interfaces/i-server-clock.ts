import { type Observable } from 'rxjs';

/**
 * Port for the server's clock (CLAUDE.md §3). Server timestamps (a round's start, a seat's last
 * beat) are compared with this device's clock, and a device clock that runs a minute fast would
 * end a one-minute countdown the moment it starts. Also the DI token; `serverClockFactory` picks
 * the adapter.
 */
export abstract class IServerClock {
  /**
   * @returns Once, how many milliseconds the server's clock is ahead of this device's (negative
   *   when behind), or `0` when it can't be measured. Never errors.
   */
  public abstract offset(): Observable<number>;
}
