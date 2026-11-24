/** Storage and sign-in technology behind the ports, chosen per environment. */
export enum BackendType {
  /** In-memory data and a fake sign-in: development, unit tests and the main e2e suite. */
  Fake = 'fake',
  /** Cloud Firestore and Firebase Auth (production, and the local emulators). */
  Firebase = 'firebase',
}
