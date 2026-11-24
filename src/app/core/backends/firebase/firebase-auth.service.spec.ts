import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { AuthError } from '@core/interfaces/i-auth-service';
import { AUTH_GATEWAY_LOADER } from './auth-gateway-loader.token';
import { FirebaseAuthService } from './firebase-auth.service';
import { type IAuthGateway } from './i-auth-gateway';
import { TEST_FIREBASE_CONFIG, firebaseTestProviders } from './testing/firebase-test-config';

describe('FirebaseAuthService', () => {
  const user = { uid: 'g1', displayName: 'Alex', isGuest: true };

  function create(gateway: IAuthGateway | null): FirebaseAuthService {
    TestBed.configureTestingModule({
      providers: [
        ...firebaseTestProviders(gateway === null ? null : TEST_FIREBASE_CONFIG),
        { provide: AUTH_GATEWAY_LOADER, useValue: () => of(gateway) },
      ],
    });
    return TestBed.runInInjectionContext(() => new FirebaseAuthService());
  }

  it('should emit the gateway user', async () => {
    const auth = create({ user$: of(user), signInAsGuest: () => of(user) });

    await expect(firstValueFrom(auth.user$)).resolves.toEqual(user);
  });

  it('should sign a guest in through the gateway', async () => {
    const auth = create({
      user$: of(null),
      signInAsGuest: (name) => of({ ...user, displayName: name }),
    });

    await expect(firstValueFrom(auth.signInAsGuest('Sam'))).resolves.toEqual({
      ...user,
      displayName: 'Sam',
    });
  });

  it('should turn SDK failures into AuthErrors', async () => {
    const auth = create({
      user$: of(null),
      signInAsGuest: () => throwError(() => ({ code: 'auth/network-request-failed' })),
    });

    await expect(firstValueFrom(auth.signInAsGuest('Sam'))).rejects.toEqual(
      new AuthError(AuthErrorKind.Network),
    );
  });

  it('should report signed out and refuse sign-in when Firebase is not configured', async () => {
    const auth = create(null);

    await expect(firstValueFrom(auth.user$)).resolves.toBeNull();
    await expect(firstValueFrom(auth.signInAsGuest('Sam'))).rejects.toEqual(
      new AuthError(AuthErrorKind.Unavailable),
    );
  });
});
