import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/**
 * `npm run start:live`: a development build against the real Firebase project. Like production,
 * the web config is read at runtime from the git-ignored `public/runtime-config.js`.
 */
export const environment: IAppEnvironment = {
  production: false,
  backend: BackendType.Firebase,
  firebase: null,
  firestoreEmulator: null,
  authEmulator: null,
};
