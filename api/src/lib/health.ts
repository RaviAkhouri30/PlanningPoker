import { type HttpResponseInit } from '@azure/functions';
import { type Observable, of } from 'rxjs';
import { API_NAME, HttpStatus } from './api-constants.js';
import { jsonResponse } from './api-handler.js';

/**
 * Answers the health check: the function app is deployed and running.
 * @param now The current time in milliseconds, supplied so tests are deterministic.
 * @returns A 200 response naming the API and the time it answered.
 */
export function health(now: number): Observable<HttpResponseInit> {
  return of(
    jsonResponse(HttpStatus.Ok, { name: API_NAME, status: 'ok', at: new Date(now).toISOString() }),
  );
}
