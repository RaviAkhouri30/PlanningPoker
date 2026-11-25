# 05 · Operations — App Check (reCAPTCHA v3)

## Release

- Version: **1.10.0** (2026-11-26). The code ships dark: no site key, no behaviour change until the owner sets the key and enforces.

## Turning it on (owner)

Full steps in [`docs/operations/pre-launch-checklist.md`](../../operations/pre-launch-checklist.md),
section 2. In short:

1. Create a reCAPTCHA v3 site key and register the web app in Firebase console → Build → App Check.
2. Put the key in `runtime-config.js` as `appCheckSiteKey` and in the CI secret
   `FIREBASE_APP_CHECK_SITE_KEY`; redeploy.
3. Watch App Check → Metrics until real traffic shows as verified, then **Enforce** on Cloud
   Firestore.
4. Verify the live site still loads (reCAPTCHA under the CSP) and add the reCAPTCHA privacy note.

## Rollback

- Remove `appCheckSiteKey` from `runtime-config.js` and turn enforcement off in the console; the
  code falls back to a plain `initializeApp`. No data migration.
