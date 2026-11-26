import { inject } from '@angular/core';
import { BrowserServerClock } from '@core/backends/browser/browser-server-clock';
import { FakeServerClock } from '@core/backends/fake/fake-server-clock';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IServerClock } from '@core/interfaces/i-server-clock';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the server clock. Runs in an injection context.
 * @returns The health function's clock in Firebase builds; no offset on the Fake backend, whose
 *   timestamps come from this device's clock anyway.
 */
export function serverClockFactory(): IServerClock {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new BrowserServerClock()
    : new FakeServerClock();
}
