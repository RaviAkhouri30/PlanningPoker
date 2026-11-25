import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/**
 * Local Firebase emulators (`npm run emulators` + `npm run start:emulator`, and the Firebase e2e
 * suite). The `demo-` project prefix makes the emulators refuse to reach any real Firebase resource.
 */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Firebase,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-planning-poker.firebaseapp.com',
    projectId: 'demo-planning-poker',
    storageBucket: 'demo-planning-poker.firebasestorage.app',
    messagingSenderId: '000000000000',
    appId: 'demo-app-id',
  },
  firestoreEmulator: { host: '127.0.0.1', port: 8080 },
  authEmulator: { host: '127.0.0.1', port: 9099 },
};
