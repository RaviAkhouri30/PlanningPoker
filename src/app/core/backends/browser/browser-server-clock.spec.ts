import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { BrowserServerClock } from './browser-server-clock';

describe('BrowserServerClock', () => {
  const RECEIVED = Date.UTC(2026, 10, 26, 9, 0, 0);

  function create(defaultView: unknown): BrowserServerClock {
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView } },
        { provide: CLOCK, useValue: { now: () => RECEIVED } },
      ],
    });
    return TestBed.runInInjectionContext(() => new BrowserServerClock());
  }

  function answering(body: () => Promise<unknown>): { fetch: ReturnType<typeof vi.fn> } {
    return { fetch: vi.fn(() => Promise.resolve({ json: body })) };
  }

  it('should report how far the server is behind when this device runs fast', async () => {
    const view = answering(() =>
      Promise.resolve({ at: new Date(RECEIVED - 75_000).toISOString() }),
    );

    await expect(firstValueFrom(create(view).offset())).resolves.toBe(-75_000);
  });

  it('should ask the health function without the cache when it measures', async () => {
    const view = answering(() => Promise.resolve({ at: new Date(RECEIVED).toISOString() }));

    await firstValueFrom(create(view).offset());

    expect(view.fetch).toHaveBeenCalledWith('/api/health', { cache: 'no-store' });
  });

  it('should report no offset when the answer has no time', async () => {
    const view = answering(() => Promise.resolve({ status: 'ok' }));

    await expect(firstValueFrom(create(view).offset())).resolves.toBe(0);
  });

  it('should report no offset when the answer is not an object', async () => {
    const view = answering(() => Promise.resolve(null));

    await expect(firstValueFrom(create(view).offset())).resolves.toBe(0);
  });

  it('should report no offset when the time is not a date', async () => {
    const view = answering(() => Promise.resolve({ at: 'soon' }));

    await expect(firstValueFrom(create(view).offset())).resolves.toBe(0);
  });

  it('should report no offset when the request fails', async () => {
    const view = { fetch: vi.fn(() => Promise.reject(new Error('offline'))) };

    await expect(firstValueFrom(create(view).offset())).resolves.toBe(0);
  });

  it('should report no offset when the function does not answer in time', async () => {
    vi.useFakeTimers();
    const view = { fetch: vi.fn(() => new Promise(() => undefined)) };
    const offset = firstValueFrom(create(view).offset());

    await vi.advanceTimersByTimeAsync(5000);

    await expect(offset).resolves.toBe(0);
    vi.useRealTimers();
  });

  it('should report no offset when there is no window', async () => {
    await expect(firstValueFrom(create(null).offset())).resolves.toBe(0);
  });
});
