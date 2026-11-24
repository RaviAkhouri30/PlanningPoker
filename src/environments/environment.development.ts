import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/**
 * `npm start`: the in-memory Fake backend, so no Firebase project is needed. Each tab is its own
 * world; use `npm run start:emulator` to try a room with several browsers.
 */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Fake,
  firebase: null,
  firestoreEmulator: null,
  authEmulator: null,
};
