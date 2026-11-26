import { type Observable, of } from 'rxjs';
import { type IServerClock } from '@core/interfaces/i-server-clock';

/** A server clock that is ahead of this device's by a fixed amount: none unless a spec says so. */
export class FakeServerClock implements IServerClock {
  /** @param ahead Milliseconds the server's clock is ahead of this device's. */
  public constructor(private readonly ahead = 0) {}

  public offset(): Observable<number> {
    return of(this.ahead);
  }
}
