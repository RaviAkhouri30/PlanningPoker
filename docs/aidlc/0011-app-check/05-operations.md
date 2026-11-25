# 05 · Operations — App Check (reCAPTCHA Enterprise)

## Release

- Version: **1.10.0** (2026-11-26). The code ships dark: no site key, no behaviour change until the owner sets the key and enforces.
- **1.10.1** (2026-11-26): the reCAPTCHA Enterprise provider and the CI secret pass-through. The
  owner set the key the same day; the live site sends App Check tokens.
- **Enforced** on Cloud Firestore by the owner on 2026-11-26, and the rejection test passed
  (`04-verification.md`). Authentication is still on monitoring (100 % verified at the time).

## Monitoring

- Firebase console → App Check → APIs: the verified share for Cloud Firestore should climb toward
  100 % as old tabs (opened before 1.10.1, the "outdated client" requests) are closed or reloaded.
- A sudden rise in unverified or invalid requests means a scripted client is being refused, which is
  the point; a drop in verified requests with user reports of rooms not loading means reCAPTCHA is
  failing for real users (check the CSP and the key's domains first).

## Turning it on (owner)

Full steps in [`docs/operations/pre-launch-checklist.md`](../../operations/pre-launch-checklist.md),
section 2. In short:

1. Create a reCAPTCHA Enterprise site key and register the web app in Firebase console → Build → App Check.
2. Put the key in `runtime-config.js` as `appCheckSiteKey` and in the CI secret
   `FIREBASE_APP_CHECK_SITE_KEY`; redeploy.
3. Watch App Check → Metrics until real traffic shows as verified, then **Enforce** on Cloud
   Firestore.
4. Verify the live site still loads (reCAPTCHA under the CSP) and add the reCAPTCHA privacy note.

## Rollback

- Remove `appCheckSiteKey` from `runtime-config.js` and turn enforcement off in the console; the
  code falls back to a plain `initializeApp`. No data migration.
