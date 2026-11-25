import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { health } from './health.js';

describe('health', () => {
  it('should answer 200 with the name and time when called', async () => {
    const response = await firstValueFrom(health(Date.UTC(2026, 10, 25)));

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      name: 'planning-poker-api',
      status: 'ok',
      at: '2026-11-25T00:00:00.000Z',
    });
  });
});
