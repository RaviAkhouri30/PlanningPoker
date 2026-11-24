import { BackendType } from '@core/enums/backend-type.enum';
import { type IAppEnvironment } from '@core/interfaces/i-app-environment';

/** Production settings. The Firebase config is read at runtime from `runtime-config.js`. */
export const environment: IAppEnvironment = {
  production: true,
  backend: BackendType.Firebase,
  firebase: null,
  firestoreEmulator: null,
  authEmulator: null,
};
