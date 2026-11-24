import { type InvocationContext } from '@azure/functions';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from './api-constants.js';
import { ApiError } from './api-error.js';
import { jsonResponse, toAzureResponse } from './api-handler.js';

function context(): InvocationContext {
  return { error: vi.fn() } as unknown as InvocationContext;
}

describe('toAzureResponse', () => {
  it('should pass the response through when the stream succeeds', async () => {
    const response = jsonResponse(HttpStatus.Ok, { ok: true });

    await expect(toAzureResponse(of(response), context())).resolves.toEqual(response);
  });

  it('should answer with the error status when the stream fails with an ApiError', async () => {
    const result = await toAzureResponse(
      throwError(() => new ApiError(HttpStatus.ServerError, 'Nope')),
      context(),
    );

    expect(result).toEqual(jsonResponse(HttpStatus.ServerError, { error: 'Nope' }));
  });

  it('should log and hide the message when the stream fails unexpectedly', async () => {
    const logs = context();

    const result = await toAzureResponse(
      throwError(() => new Error('secret detail')),
      logs,
    );

    expect(result.jsonBody).toEqual({ error: 'Something went wrong.' });
    expect(logs.error).toHaveBeenCalledWith('secret detail');
  });

  it('should log a placeholder when the failure is not an Error', async () => {
    const logs = context();

    await toAzureResponse(
      throwError(() => 'text'),
      logs,
    );

    expect(logs.error).toHaveBeenCalledWith('Unknown failure');
  });
});
