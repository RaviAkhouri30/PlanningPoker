import { type Provider } from '@angular/core';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';
import { type IFirebaseConfig } from '@core/interfaces/i-firebase-config';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';

/** A complete (fake) Firebase config for adapter specs. */
export const TEST_FIREBASE_CONFIG: IFirebaseConfig = {
  apiKey: 'k',
  authDomain: 'd',
  projectId: 'p',
  storageBucket: 'b',
  messagingSenderId: 'm',
  appId: 'a',
};

/** A Firebase build environment with emulators, for adapter specs. */
export const TEST_FIREBASE_ENVIRONMENT: IAppEnvironment = {
  production: false,
  backend: BackendType.Firebase,
  firebase: TEST_FIREBASE_CONFIG,
  firestoreEmulator: { host: 'localhost', port: 8080 },
  authEmulator: { host: 'localhost', port: 9099 },
};

/**
 * @param config The Firebase config the adapter sees, or `null` for none.
 * @returns Providers for the environment and the config.
 */
export function firebaseTestProviders(config: IFirebaseConfig | null): Provider[] {
  return [
    { provide: APP_ENVIRONMENT, useValue: TEST_FIREBASE_ENVIRONMENT },
    { provide: FIREBASE_CONFIG, useValue: config },
  ];
}
