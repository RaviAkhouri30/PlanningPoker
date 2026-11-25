# 04 · Verification — App Check (reCAPTCHA Enterprise)

| Check                  | Result                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| `npm run verify`       | ✔ (format, lint, diagrams, typecheck, coverage, api, build)                   |
| `firebase-app.spec.ts` | ✔ 5/5 (starts once with a key, skips without/empty, strips the non-SDK field) |
| Gateway + loader specs | ✔ unchanged behaviour with `firebase/app-check` mocked                        |
| Bundle                 | App Check initialised once (shared `firebase-app` chunk)                      |

## Live, on www.planningpoker.in (2026-11-26)

After the 1.10.1 deploy, before enforcement:

- The live `runtime-config.js` carries the site key; reCAPTCHA Enterprise loads under the CSP and
  `exchangeRecaptchaEnterpriseToken` returns 200.
- Every Firestore Listen and Write channel carries an `X-Firebase-AppCheck` token issued by
  Firebase App Check for the `planningpoker-web` app (1-hour TTL). No console errors.

After the owner turned on **Enforce** for Cloud Firestore (same day), the rejection test: the
same signed-in guest read the same room document through the Firestore REST API twice.

| Request                                | Result                                     |
| -------------------------------------- | ------------------------------------------ |
| ID token **and** App Check token       | ✔ 200, the room document                   |
| ID token, **no** App Check token       | ✔ 403 `PERMISSION_DENIED`: refused         |
| The live room, reloaded in the browser | ✔ loads and works; the app sends the token |

The rules allow that guest to read the room, so the only difference — the missing App Check
token — is what Firestore refused. Firestore reports it as `PERMISSION_DENIED`, the same status a
rules denial gives.

## What is and isn't proven here

- Unit specs prove the wiring: App Check starts with a site key, once, and not without one, and
  the non-SDK field never reaches `initializeApp`.
- They do **not** prove reCAPTCHA end to end — the emulators don't enforce App Check and the Fake
  backend has no SDK. That needs the owner's real site key and a deploy, then watching the App
  Check metrics before enforcing (owner steps in `05-operations.md` and the pre-launch checklist).
