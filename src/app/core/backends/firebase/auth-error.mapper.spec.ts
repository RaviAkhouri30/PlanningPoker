import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';
import { toAuthError } from './auth-error.mapper';

describe('toAuthError', () => {
  it('should keep an AuthError when given one', () => {
    const error = new AuthError(AuthErrorKind.Unavailable);

    expect(toAuthError(error)).toBe(error);
  });

  it('should report a network failure when the SDK code says so', () => {
    expect(toAuthError({ code: 'auth/network-request-failed' }).kind).toBe(AuthErrorKind.Network);
  });

  it.each([{ code: 'auth/other' }, 'text', null])(
    'should report Unknown when given %o',
    (error) => {
      expect(toAuthError(error).kind).toBe(AuthErrorKind.Unknown);
    },
  );

  it('should read the kind of any error', () => {
    expect(AuthError.kindOf(new Error('x'))).toBe(AuthErrorKind.Unknown);
    expect(AuthError.kindOf(new AuthError(AuthErrorKind.Network))).toBe(AuthErrorKind.Network);
  });
});
