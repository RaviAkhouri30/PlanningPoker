# 04 · Verification — App Check (reCAPTCHA Enterprise)

| Check                                   | Result                                                        |
| --------------------------------------- | ------------------------------------------------------------- |
| `npm run verify`                        | ✔ (format, lint, diagrams, typecheck, coverage, api, build)    |
| `firebase-app.spec.ts`                  | ✔ 5/5 (starts once with a key, skips without/empty, strips the non-SDK field) |
| Gateway + loader specs                  | ✔ unchanged behaviour with `firebase/app-check` mocked         |
| Bundle                                  | App Check initialised once (shared `firebase-app` chunk)       |

## What is and isn't proven here

- Unit specs prove the wiring: App Check starts with a site key, once, and not without one, and
  the non-SDK field never reaches `initializeApp`.
- They do **not** prove reCAPTCHA end to end — the emulators don't enforce App Check and the Fake
  backend has no SDK. That needs the owner's real site key and a deploy, then watching the App
  Check metrics before enforcing (owner steps in `05-operations.md` and the pre-launch checklist).
