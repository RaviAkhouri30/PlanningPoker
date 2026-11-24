import { type BackendType } from '@core/enums/backend-type.enum';
import { type IEmulatorAddress, type IFirebaseConfig } from './i-firebase-config';

/** Build-time settings, provided through `APP_ENVIRONMENT`. */
export interface IAppEnvironment {
  readonly production: boolean;
  readonly backend: BackendType;
  /**
   * Build-time Firebase settings. `null` reads them at runtime from `runtime-config.js`
   * (production); only the emulator build sets them here.
   */
  readonly firebase: IFirebaseConfig | null;
  /** Local Firestore emulator to connect to, or `null` for the real service. */
  readonly firestoreEmulator: IEmulatorAddress | null;
  /** Local Auth emulator to connect to, or `null` for the real service. */
  readonly authEmulator: IEmulatorAddress | null;
}
