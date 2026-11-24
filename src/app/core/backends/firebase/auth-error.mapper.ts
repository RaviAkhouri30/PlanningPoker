import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';

/** Firebase Auth error codes that mean the network failed. */
const NETWORK_CODES: ReadonlySet<string> = new Set(['auth/network-request-failed', 'auth/timeout']);

/**
 * @param error Anything the Auth SDK failed with.
 * @returns An `AuthError` with a provider-independent kind.
 */
export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }
  const code: unknown =
    typeof error === 'object' && error !== null ? Reflect.get(error, 'code') : undefined;
  return new AuthError(
    typeof code === 'string' && NETWORK_CODES.has(code)
      ? AuthErrorKind.Network
      : AuthErrorKind.Unknown,
  );
}
