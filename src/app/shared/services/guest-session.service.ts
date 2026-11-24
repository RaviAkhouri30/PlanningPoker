import { Service, inject } from '@angular/core';
import { type Observable, of, switchMap, take } from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';

/**
 * Makes sure the visitor is signed in, as a nameless guest if need be, before reading a room:
 * the rules let only signed-in people read rooms and codes (ADR-0007, ADR-0008).
 */
@Service()
export class GuestSessionService {
  private readonly auth = inject(IAuthService);

  /** @returns The signed-in person, signing in a nameless guest first if nobody is; once. */
  public ensureSignedIn(): Observable<IAuthUser> {
    return this.auth.user$.pipe(
      take(1),
      // take(1): one decision, so switchMap only ever has one inner stream.
      switchMap((user) => (user === null ? this.auth.signInAsGuest('') : of(user))),
    );
  }
}
