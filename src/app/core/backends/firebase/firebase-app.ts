import { type FirebaseApp, initializeApp } from 'firebase/app';
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from 'firebase/app-check';
import { type IFirebaseConfig } from '@core/interfaces/i-firebase-config';

/** Apps whose App Check is already running, so the two gateways don't start it twice. */
const checkedApps = new WeakSet<FirebaseApp>();

/**
 * The default Firebase app, shared by the Auth and Firestore gateways.
 *
 * `initializeApp` is idempotent — called again with the same options it returns the existing
 * default app — so either gateway may call this. The first call that has an App Check site key
 * starts **App Check** on the app: reCAPTCHA Enterprise (Fraud Defense) then attaches an
 * attestation token to every Firestore and Auth request, and the rules reject anything without a
 * valid one once enforcement
 * is on. That is this app's stand-in for a rate limiter — there is no server in front of Firestore
 * — so a script can't drain the free quota or run up a bill (ADR-0012,
 * docs/operations/pre-launch-checklist.md). Without a key it is a plain `initializeApp`, so the
 * emulators, `npm start` and the Fake backend are untouched.
 *
 * @param config Firebase web settings, optionally carrying the App Check site key.
 * @returns The initialised default app.
 */
export function getFirebaseApp(config: IFirebaseConfig): FirebaseApp {
  // The site key is not a FirebaseOptions field; keep it out of initializeApp.
  const { appCheckSiteKey, ...options } = config;
  const app = initializeApp({ ...options });
  if (appCheckSiteKey !== undefined && appCheckSiteKey.length > 0 && !checkedApps.has(app)) {
    checkedApps.add(app);
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      // Keep a fresh token through a long room session.
      isTokenAutoRefreshEnabled: true,
    });
  }
  return app;
}
