import { InjectionToken } from '@angular/core';
import { type RandomSource } from '@core/interfaces/i-random';

/** One more than the largest 32-bit unsigned integer: scales a random word into [0, 1). */
const UINT32_RANGE = 4_294_967_296;

/**
 * Random numbers for room ids and codes, from the platform's cryptographic generator, so a room's
 * id can't be predicted from another's. Override in tests for fixed values.
 */
export const RANDOM = new InjectionToken<RandomSource>('RANDOM', {
  providedIn: 'root',
  factory: () => () => (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / UINT32_RANGE,
});
