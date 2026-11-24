import { BehaviorSubject, type Observable, defer, of, tap } from 'rxjs';
import { type IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';

/** The uid the fake signs every guest in with; e2e and specs refer to it. */
export const FAKE_GUEST_UID = 'fake-guest-uid';

/** Sign-in without a server, for development, unit tests and the Fake e2e suite. */
export class FakeAuthService implements IAuthService {
  public readonly user$: Observable<IAuthUser | null>;

  private readonly user = new BehaviorSubject<IAuthUser | null>(null);

  public constructor() {
    // Assigned here because field initialisers run in declaration order.
    this.user$ = this.user.asObservable();
  }

  public signInAsGuest(displayName: string): Observable<IAuthUser> {
    // defer: the uid is read on subscribe, so a rename keeps the person signed in before.
    return defer(() => {
      const uid = this.user.value?.uid ?? FAKE_GUEST_UID;
      return of<IAuthUser>({ uid, displayName, isGuest: true });
    }).pipe(
      tap((user) => {
        this.user.next(user);
      }),
    );
  }
}
