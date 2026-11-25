# 01 · Inception — App Check (reCAPTCHA Enterprise)

Requested by the owner on 2026-11-26: "what about DDoS, let's implement CAPTCHA, in case a rate
limiter is not possible." Follows the DoS / denial-of-wallet finding in the security audit
([AIDLC 0010](../0010-performance-and-security/04-verification.md)).

## Problem / goal

There is no server of ours in front of Firestore to rate-limit, and anonymous sign-in is open, so
a script could exhaust the project's daily free quota (an outage until reset on Spark, a bill on
Blaze). The rules bound each write but cannot throttle requests. Close the hole with the right
CAPTCHA for an API-backed app: **App Check with reCAPTCHA Enterprise**, which attests _every_ request
invisibly — not a visible challenge on one form.

## User stories

1. As the owner, only my real app can spend the project's quota; a scripted client is rejected.
2. As the owner, I can ship this dark and turn it on from the console when the metrics look right,
   without locking real users out.
3. As a developer, local work, the emulators and the Fake backend are unaffected (no key, no
   App Check).

## Acceptance criteria

- App Check starts once on the shared Firebase app when a reCAPTCHA Enterprise **site key** is present in
  `runtime-config.js`; with no key it is a plain `initializeApp`.
- The site key is public, optional, written by CI from a secret, and never passed to
  `initializeApp` (it is not a `FirebaseOptions` field).
- Specs cover: starts with the key (once), skips without it, skips on an empty key, passes only the
  SDK fields to `initializeApp`. Coverage stays ≥ 90 %.
- Enforcement stays an owner console step, documented, done after the metrics show verified
  traffic.

## Risks & open questions

- reCAPTCHA Enterprise loads a Google script/iframe; confirmed compatible with the `strict-dynamic` CSP in
  reasoning (ADR-0012), to be verified on the live site at enforcement.
- reCAPTCHA sends signals to Google — a privacy-copy note is owed before enforcement, aligned with
  the AdSense consent work.
- The emulators do not enforce App Check, so `e2e:firebase` is unchanged; a real end-to-end check
  needs the live key and is an owner step.
