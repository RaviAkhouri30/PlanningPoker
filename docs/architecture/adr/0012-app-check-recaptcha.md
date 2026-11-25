# ADR-0012: App Check (reCAPTCHA Enterprise) as the stand-in for a rate limiter

- **Status:** Accepted
- **Date:** 2026-11-26
- **Version:** 1.10.0 (wired as classic reCAPTCHA v3); 1.10.1 switched to reCAPTCHA Enterprise

## Context

The client talks to Firestore directly; there is no server of ours in front of it to rate-limit
(ADR-0006, ADR-0009). Anyone can sign in anonymously (ADR-0007), so a script could create rooms,
cast votes and drive reads to exhaust the project's daily free quota — taking every room down until
the reset on Spark, or running up a bill on Blaze (the denial-of-service / denial-of-wallet finding
in `docs/aidlc/0010-performance-and-security/04-verification.md`). The `firestore.rules` bound what
a request may write but cannot count or throttle requests, and a visible CAPTCHA on one form would
not cover the reads and writes that make up the quota.

## Decision

Turn on **Firebase App Check** with the **reCAPTCHA Enterprise** provider (Firebase's "Fraud
Defense"). The SDK attaches an invisible attestation token to every Firestore and Auth request;
with enforcement on, Firestore rejects any request without a valid token, so only the real app
(served from our domain, scored by reCAPTCHA) can spend the quota.

Why Enterprise and not classic reCAPTCHA v3: Firebase App Check now marks the **classic reCAPTCHA
provider as deprecated** ("Please use Google Cloud Fraud Defense instead"), so a new setup is built
on the supported path. The code uses `ReCaptchaEnterpriseProvider` (from 1.10.1; 1.10.0 shipped the
classic `ReCaptchaV3Provider`, never activated as there was no key yet). Enterprise runs through the
Google Cloud reCAPTCHA Enterprise API, which needs **billing enabled** on the project (the Blaze
upgrade already planned) and is free under ~10,000 assessments/month.

- The reCAPTCHA Enterprise **site key** is public and rides in `runtime-config.js` as an optional
  `appCheckSiteKey` (`IFirebaseConfig`), written by CI from `FIREBASE_APP_CHECK_SITE_KEY` when the
  secret is set. It is not a `FirebaseOptions` field, so `getFirebaseApp` strips it before
  `initializeApp`.
- App Check is started once, on the shared default app, in `core/backends/firebase/firebase-app.ts`
  (both gateways route through it). With no key it is a plain `initializeApp`, so the emulators,
  `npm start` and the Fake backend are unaffected.
- **Enforcement is a separate, owner-side step** in the Firebase console, done only after the
  App Check metrics show real traffic as verified, so legitimate users are never locked out.

## Consequences

- The main defence against quota exhaustion without adding a server; keeps the serverless, ports-
  and-adapters design (only `core/backends` touches the SDK).
- Nothing changes until the owner creates the key and flips enforcement, so this can ship dark and
  be turned on when ready (`docs/operations/pre-launch-checklist.md`).
- reCAPTCHA Enterprise loads a Google script and iframe at runtime; it is injected by the
  already-trusted SDK, so the `strict-dynamic` script-src allows it, and the CSP sets no
  `frame-src`/`connect-src`,
  so its frame and calls are allowed. Verify on the live site when enforcement goes on.
- A privacy note: reCAPTCHA sends signals to Google. The privacy copy should mention it before
  enforcement, and it pairs with the consent work in the AdSense plan.
- Follow-ups: optionally add an App Check debug token for CI/e2e against a real project later; the
  emulators do not enforce App Check, so `e2e:firebase` is unaffected.
