import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type Observable, catchError, defer, map, of, switchMap, timeout } from 'rxjs';
import { type IServerClock } from '@core/interfaces/i-server-clock';
import { CLOCK } from '@core/tokens/clock.token';

/** The app's own Azure Function: answers with the server time, `{ at: ISO string }`, uncached. */
const SERVER_TIME_URL = '/api/health';

/** When the time can't be read, this device's clock is the best there is. */
const NO_OFFSET = 0;

/** A slow or cold function must not hold the countdown back for long. */
const SERVER_TIME_TIMEOUT_MS = 5000;

/**
 * @param body The health check's JSON.
 * @param received This device's time when the answer arrived, in ms.
 * @returns How far the server's clock is ahead of this device's, or `NO_OFFSET`.
 */
function offsetFrom(body: unknown, received: number): number {
  const at: unknown =
    typeof body === 'object' && body !== null ? (body as { at?: unknown }).at : undefined;
  const server = typeof at === 'string' ? Date.parse(at) : Number.NaN;
  // Compared with the arrival, not the midpoint of the trip: a cold start delays the request
  // before the function reads its clock, while the answer comes straight back.
  return Number.isFinite(server) ? server - received : NO_OFFSET;
}

/** Reads the server's time from the app's own health function. */
export class BrowserServerClock implements IServerClock {
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly clock = inject(CLOCK);

  public offset(): Observable<number> {
    const view = this.view;
    if (view === null) {
      return of(NO_OFFSET);
    }
    // fetch and json() return Promises; defer() keeps them lazy and inside this adapter (§7).
    return defer(() => view.fetch(SERVER_TIME_URL, { cache: 'no-store' })).pipe(
      // switchMap: one response, one body.
      switchMap((response) => defer((): Promise<unknown> => response.json())),
      map((body) => offsetFrom(body, this.clock.now())),
      timeout({ first: SERVER_TIME_TIMEOUT_MS }),
      // No API (npm start, the emulators), offline or too slow: fall back to this device's clock.
      catchError(() => of(NO_OFFSET)),
    );
  }
}
