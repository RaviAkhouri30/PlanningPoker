# 03 · Construction — App Check (reCAPTCHA Enterprise)

## Increments

1. `firebase-app.ts` (+ spec) with `getFirebaseApp`; both gateways route through it.
2. `IFirebaseConfig.appCheckSiteKey` (optional); the SDK mock gains `firebase/app-check`
   (`initializeAppCheck`, `ReCaptchaEnterpriseProvider`); the three gateway/loader specs mock that module.
3. Runtime config: `scripts/write-runtime-config.mjs` writes `appCheckSiteKey` from
   `FIREBASE_APP_CHECK_SITE_KEY` when set; `runtime-config.example.js` shows it commented out.
4. ADR-0012, this record, the pre-launch checklist marked done for the code half.

## Decision log

| Date       | Decision                                                                  | Why                                                                                                           |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-11-26 | App Check / reCAPTCHA Enterprise, not a visible CAPTCHA                   | Attests every read and write, not one form; covers the quota vector                                           |
| 2026-11-26 | reCAPTCHA **Enterprise** (Fraud Defense), not classic v3                  | Firebase deprecated the classic provider; 1.10.0 shipped v3, 1.10.1 switched to `ReCaptchaEnterpriseProvider` |
| 2026-11-26 | Site key optional in `runtime-config.js`, stripped before `initializeApp` | Ship dark; keep it off locally; don't leak a non-SDK field to the SDK                                         |
| 2026-11-26 | Start App Check in one shared `getFirebaseApp`, guarded by a `WeakSet`    | Both gateways init the app; start App Check exactly once                                                      |
| 2026-11-26 | Enforcement left to the console after metrics look clean                  | Enforcing early would lock real users out                                                                     |
