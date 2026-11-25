/**
 * Firebase web app settings. Public by design (every visitor's browser receives them), so the
 * data is protected by `firestore.rules`, not by hiding these values. Mirrors the SDK's
 * `FirebaseOptions`, so no SDK type leaks out of `core/backends`.
 */
export interface IFirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  /**
   * App Check reCAPTCHA Enterprise site key (ADR-0012). When set, every Firestore and Auth request carries
   * an attestation token, so only the real app can spend the project's quota — the defence against
   * scripted abuse where there is no server to rate-limit. Public (it rides in the browser), and
   * not an SDK `FirebaseOptions` field, so it is stripped before `initializeApp`. Absent on the
   * emulators, locally and on the Fake backend, where App Check stays off.
   */
  readonly appCheckSiteKey?: string;
}

/** Address of a local Firebase emulator. */
export interface IEmulatorAddress {
  readonly host: string;
  readonly port: number;
}
