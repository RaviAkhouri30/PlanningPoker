/**
 * Stand-ins for `firebase/app`, `firebase/firestore` and `firebase/auth`, shared by every spec that
 * mocks the SDK. One definition matters: the coverage run shares modules between spec files, so two
 * different mocks of the same package would clash.
 */
export const firebaseAppMock = {
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
};

export const appCheckMock = {
  initializeAppCheck: vi.fn(),
  ReCaptchaEnterpriseProvider: vi.fn(),
};

export const firestoreMock = {
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  connectFirestoreEmulator: vi.fn(),
  doc: vi.fn((_db: unknown, path: string) => ({ path })),
  collection: vi.fn((_db: unknown, path: string) => ({ path })),
  query: vi.fn((reference: unknown, ...constraints: unknown[]) => ({ reference, constraints })),
  orderBy: vi.fn((field: string) => ({ orderBy: field })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  onSnapshot: vi.fn(() => () => undefined),
  writeBatch: vi.fn(),
};

export const firebaseAuthMock = {
  getAuth: vi.fn(() => ({ currentUser: null })),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => undefined),
  signInAnonymously: vi.fn(),
  updateProfile: vi.fn(() => Promise.resolve()),
};
