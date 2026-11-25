// Template for public/runtime-config.js (git-ignored, CLAUDE.md §10). Copy it to
// runtime-config.js and fill in the values from Firebase console → Project settings → Your apps.
// Production gets its copy from CI (scripts/write-runtime-config.mjs + GitHub secrets).
globalThis.__FIREBASE_CONFIG__ = {
  apiKey: '<api key>',
  authDomain: '<project id>.firebaseapp.com',
  projectId: '<project id>',
  storageBucket: '<project id>.firebasestorage.app',
  messagingSenderId: '<messaging sender id>',
  appId: '<app id>',
  // Optional: App Check reCAPTCHA Enterprise site key. Set it to turn on App Check (ADR-0012); leave it
  // out for local work and the emulators.
  // appCheckSiteKey: '<recaptcha v3 site key>',
};
