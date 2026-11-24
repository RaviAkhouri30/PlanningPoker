import { initializeApp } from 'firebase/app';
import {
  type Auth,
  type User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { Observable, defer, map, of, switchMap } from 'rxjs';
import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type IEmulatorAddress, type IFirebaseConfig } from '@core/interfaces/i-firebase-config';
import { type IAuthGateway } from './i-auth-gateway';

/** @returns The app's view of a Firebase user. */
function toAuthUser(user: User, displayName = user.displayName ?? ''): IAuthUser {
  return { uid: user.uid, displayName, isGuest: user.isAnonymous };
}

/**
 * The only file that imports `firebase/auth`. `AUTH_GATEWAY_LOADER` loads it with a dynamic
 * `import()` on first use. Every SDK Promise is wrapped with `defer` (CLAUDE.md §7).
 */
export class AuthGateway implements IAuthGateway {
  /** The signed-in user, or `null`; Firebase restores a persisted session before the first value. */
  public readonly user$: Observable<IAuthUser | null>;

  private readonly auth: Auth;

  /**
   * @param config Firebase web settings.
   * @param emulator Local Auth emulator to use instead of the real service, or `null`.
   */
  public constructor(config: IFirebaseConfig, emulator: IEmulatorAddress | null) {
    // initializeApp returns the existing default app when called again with the same options.
    this.auth = getAuth(initializeApp({ ...config }));
    if (emulator !== null) {
      connectAuthEmulator(this.auth, `http://${emulator.host}:${String(emulator.port)}`, {
        disableWarnings: true,
      });
    }
    const auth = this.auth;
    // onAuthStateChanged returns its unsubscribe function, which becomes the teardown.
    this.user$ = new Observable<IAuthUser | null>((subscriber) =>
      onAuthStateChanged(
        auth,
        (user) => {
          subscriber.next(user ? toAuthUser(user) : null);
        },
        (error) => {
          subscriber.error(error);
        },
      ),
    );
  }

  public signInAsGuest(displayName: string): Observable<IAuthUser> {
    // defer: the current user is read on subscribe, so someone already signed in keeps their uid.
    return defer(() => {
      const current = this.auth.currentUser;
      return current === null
        ? defer(() => signInAnonymously(this.auth)).pipe(map((credential) => credential.user))
        : of(current);
    }).pipe(
      // One user arrives, so switchMap only ever follows one profile update.
      switchMap((user) =>
        defer(() => updateProfile(user, { displayName })).pipe(
          map(() => toAuthUser(user, displayName)),
        ),
      ),
    );
  }
}
