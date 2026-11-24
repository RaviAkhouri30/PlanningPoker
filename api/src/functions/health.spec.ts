import { type HttpHandler, type InvocationContext } from '@azure/functions';
import { describe, expect, it, vi } from 'vitest';

const registered = vi.hoisted(() => new Map<string, HttpHandler>());

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, options: { handler: HttpHandler }) => {
      registered.set(name, options.handler);
    },
  },
}));

describe('health function', () => {
  it('should register a handler that answers 200 when called', async () => {
    await import('./health.js');
    const handler = registered.get('health');

    const response = await handler?.(
      {} as Parameters<HttpHandler>[0],
      { error: vi.fn() } as unknown as InvocationContext,
    );

    expect(response?.status).toBe(200);
  });
});
