import { type Observable } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';

/** A signed-in person, as the app sees it (no provider types). */
export interface IAuthUser {
  readonly uid: string;
  /** Empty until a name is set. */
  readonly displayName: string;
  /** Signed in anonymously, with just a name (ADR-0007). */
  readonly isGuest: boolean;
}

/** A failed sign-in, with a provider-independent reason. */
export class AuthError extends Error {
  public constructor(public readonly kind: AuthErrorKind) {
    super(`Sign-in failed: ${kind}`);
    this.name = 'AuthError';
  }

  /**
   * @param error Anything a sign-in call failed with.
   * @returns Its kind, or `Unknown` when it isn't an `AuthError`.
   */
  public static kindOf(error: unknown): AuthErrorKind {
    return error instanceof AuthError ? error.kind : AuthErrorKind.Unknown;
  }
}

/**
 * Port for signing in (CLAUDE.md §3). Also the DI token; `authServiceFactory` picks the Firebase
 * adapter or the fake one. Every call is a cold Observable; failures are `AuthError`s.
 */
export abstract class IAuthService {
  /** The signed-in person, or `null`; emits the current state to each new subscriber. */
  public abstract readonly user$: Observable<IAuthUser | null>;

  /**
   * Signs in as a guest with just a name, or renames the person already signed in, so a refresh
   * or a second room keeps the same identity.
   * @param displayName The name others see.
   * @returns The person, once; completes.
   */
  public abstract signInAsGuest(displayName: string): Observable<IAuthUser>;
}
