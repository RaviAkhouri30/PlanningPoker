import { type InvocationContext } from '@azure/functions';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { jsonResponse, toAzureResponse } from './api-handler.js';

/** A context whose `error` log is a spy, returned alongside it so tests assert on the spy itself. */
function context(): { logs: InvocationContext; error: ReturnType<typeof vi.fn> } {
  const error = vi.fn();
  return { logs: { error } as unknown as InvocationContext, error };
}

describe('toAzureResponse', () => {
  it('should pass the response through when the stream succeeds', async () => {
    const response = jsonResponse(HttpStatus.Ok, { ok: true });

    await expect(toAzureResponse(of(response), context().logs)).resolves.toEqual(response);
  });

  it('should answer with the error status when the stream fails with an ApiError', async () => {
    const result = await toAzureResponse(
      throwError(() => new ApiError(HttpStatus.ServerError, 'Nope')),
      context().logs,
    );

    expect(result).toEqual(jsonResponse(HttpStatus.ServerError, { error: 'Nope' }));
  });

  it('should log and hide the message when the stream fails unexpectedly', async () => {
    const { logs, error } = context();

    const result = await toAzureResponse(
      throwError(() => new Error('secret detail')),
      logs,
    );

    expect(result.jsonBody).toEqual({ error: 'Something went wrong.' });
    expect(error).toHaveBeenCalledWith('secret detail');
  });

  it('should log a placeholder when the failure is not an Error', async () => {
    const { logs, error } = context();

    await toAzureResponse(
      throwError(() => 'text'),
      logs,
    );

    expect(error).toHaveBeenCalledWith('Unknown failure');
  });
});
