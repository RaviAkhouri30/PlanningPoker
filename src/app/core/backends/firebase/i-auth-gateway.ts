import { type Observable } from 'rxjs';
import { type IAuthUser } from '@core/interfaces/i-auth-service';
import { type IEmulatorAddress, type IFirebaseConfig } from '@core/interfaces/i-firebase-config';

/** The Firebase Auth operations `FirebaseAuthService` needs; implemented by `AuthGateway`. */
export interface IAuthGateway {
  readonly user$: Observable<IAuthUser | null>;
  signInAsGuest(displayName: string): Observable<IAuthUser>;
}

/** Creates an auth gateway, loading the SDK chunk first. */
export type AuthGatewayLoader = (
  config: IFirebaseConfig,
  emulator: IEmulatorAddress | null,
) => Observable<IAuthGateway>;
