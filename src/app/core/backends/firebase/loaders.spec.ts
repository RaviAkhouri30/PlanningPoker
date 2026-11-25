import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthGateway } from './auth-gateway';
import { AUTH_GATEWAY_LOADER } from './auth-gateway-loader.token';
import { FirestoreGateway } from './firestore-gateway';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';

vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/app-check',
  async () => (await import('./testing/firebase-sdk.mock')).appCheckMock,
);
vi.mock(
  'firebase/firestore',
  async () => (await import('./testing/firebase-sdk.mock')).firestoreMock,
);
vi.mock(
  'firebase/auth',
  async () => (await import('./testing/firebase-sdk.mock')).firebaseAuthMock,
);

describe('gateway loaders', () => {
  const config = {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };

  it('should load the Firestore gateway chunk when subscribed', async () => {
    const load = TestBed.inject(FIRESTORE_GATEWAY_LOADER);

    await expect(firstValueFrom(load(config, null))).resolves.toBeInstanceOf(FirestoreGateway);
  });

  it('should load the Auth gateway chunk when subscribed', async () => {
    const load = TestBed.inject(AUTH_GATEWAY_LOADER);

    await expect(firstValueFrom(load(config, null))).resolves.toBeInstanceOf(AuthGateway);
  });
});
