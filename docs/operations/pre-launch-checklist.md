# Pre-launch checklist (before sharing on LinkedIn)

The code side of capacity, performance and security is done (v1.9.0, AIDLC 0010). What's left are
console and billing actions on the real Firebase project (`planningpoker-6bc64`) and one small
code change for App Check. Order matters: **Blaze first** (so you have headroom and alerting),
then **App Check**, then enforce.

Project IDs you'll need: Firebase project `planningpoker-6bc64`, site `www.planningpoker.in`.

---

## 1. Firebase Blaze + a budget alert — 10 min, owner only

Blaze keeps the same free daily quota and only bills above it. The budget alert is what turns a
traffic spike into an email instead of a silent outage or a surprise bill.

- [ ] Firebase console → ⚙ (Project settings) → **Usage and billing** → **Details & settings** →
      **Modify plan** → choose **Blaze**.
- [ ] Link a **Cloud Billing account** (needs a card). Create one if you don't have it.
- [ ] Set a **budget alert**. Either accept the prompt during the upgrade, or:
      Google Cloud console → **Billing** → **Budgets & alerts** → **Create budget** →
      scope to project `planningpoker-6bc64` → amount e.g. **$10/month** → alert thresholds
      **50% / 90% / 100%** → add your email.
- [ ] (Optional but recommended) Firestore console → **Usage** → set it as a bookmark; watch
      reads/writes vs. the daily free quota for the first busy days.

> Why: without Blaze, a few busy sessions exhaust the day's 50k reads / 20k writes and **every
> room stops** until the quota resets (13:30 IST). With Blaze, it keeps working and costs about
> a cent per 10-person session-hour — the budget alert caps the surprise.

---

## 2. App Check — closes the DoS / denial-of-wallet hole

App Check makes Firestore reject any request that doesn't come from your real app, so a script
can't spam your quota. It is **part console, part code**.

### 2a. reCAPTCHA + register the provider (owner, console) — 10 min

- [ ] Get a **reCAPTCHA v3 site key**: Firebase console → **Build → App Check** → your web app →
      **reCAPTCHA v3** → follow the link to create a key, add the domains
      `www.planningpoker.in`, `planningpoker.in` and (for testing) `localhost`. Copy the
      **site key**.
- [ ] In **App Check**, register the web app with that reCAPTCHA v3 site key.
- [ ] Put the site key where the app can read it: add it to `public/runtime-config.js` (the
      git-ignored runtime config) and to the CI secret that writes that file, as e.g.
      `appCheckSiteKey`. (The site key is public by design — it is safe in the client.)

### 2b. Wire the provider (code — **done in 1.10.0**, ADR-0012)

- [x] Done: `getFirebaseApp` ([firebase-app.ts](../../src/app/core/backends/firebase/firebase-app.ts))
      starts App Check once when `runtime-config.js` carries `appCheckSiteKey`; both gateways route
      through it, and it's a no-op without a key (so `npm start`, the emulators and the Fake
      backend are untouched).
- [ ] After you set the key and deploy, confirm the app still loads (reCAPTCHA under the CSP);
      the `strict-dynamic` policy should allow the SDK-injected script (ADR-0012).

### 2c. Enforce (owner, console) — after 2b is deployed

- [ ] Watch **App Check → your app → Metrics** for a day. When nearly all requests show as
      **verified**, click **Enforce** for **Cloud Firestore**.
- [ ] If legitimate traffic were still unverified, enforcing would lock users out — that's why
      you enforce only after the metrics look clean.

---

## 3. Auth authorised domains — 2 min, owner only

- [ ] Firebase console → **Authentication → Settings → Authorized domains** → confirm
      `www.planningpoker.in` (and `planningpoker.in`) are listed. Anonymous sign-in fails on a
      domain that isn't.

---

## 4. Verify the live security headers — after the 1.9.0 deploy

```bash
curl -sI https://www.planningpoker.in/ | grep -iE 'x-frame|content-security|strict-transport|x-content-type|referrer|permissions-policy'
```

- [ ] Expect `X-Frame-Options: DENY`, a `Content-Security-Policy` with `frame-ancestors 'none'`,
      `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`,
      `Permissions-Policy`.

---

## Later, not blockers

- Azure **Standard + Front Door** (a WAF) if you ever face a volumetric DDoS on the pages.
- **Prerender** the landing page (needs an ADR) to cut the 2.7 s mobile LCP render delay.
- HSTS `includeSubDomains; preload` once every subdomain is HTTPS.
- The AdSense provision (separate plan in
  [`docs/performance/2026-11-25-capacity-and-performance.md`](../performance/2026-11-25-capacity-and-performance.md)).
