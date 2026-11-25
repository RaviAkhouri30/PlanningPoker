# 05 · Operations — Performance hardening and a security audit

## Release

- Version: **1.9.0** (2026-11-26) — a minor release: new presence behaviour, caching and security
  headers. Bumped in `package.json`, CHANGELOG updated, committed and pushed to `main`.
- Deploy is the usual `azure-static-web-apps.yml` on a push to `main`. The new
  `globalHeaders` and cache rules in `staticwebapp.config.json` take effect on that deploy.

## Verify after deploy

Headers are set by Azure, not by the build, so check them on the live site:

```bash
curl -sI https://www.planningpoker.in/ | grep -iE 'x-frame|content-security|x-content-type|strict-transport|referrer|permissions-policy'
curl -sI https://www.planningpoker.in/main-*.js | grep -i cache-control   # expect immutable, max-age=31536000
```

## Owner actions before the LinkedIn launch (not code)

1. **Firebase → Blaze with a budget alert.** Keeps the same free daily quota, then bills a few
   cents per session-hour; the alert pages you on a spike instead of the site silently failing.
2. **Turn on App Check** (reCAPTCHA) and enforce it on Firestore, so only the real app can spend
   the quota — the main defence against the denial-of-wallet / DoS vector in `04-verification.md`.
3. **Confirm Auth authorised domains** include `www.planningpoker.in`.
4. Optional, stronger hardening later: Azure Standard + Front Door (a WAF) for volumetric DDoS;
   HSTS `includeSubDomains; preload` once every subdomain is HTTPS; prerender the landing page
   (ADR) to cut the 2.7 s LCP render delay.

## Monitoring

- Watch the Firebase usage dashboard (reads/writes vs. the daily quota) and the Auth sign-in
  metrics for the first busy days. No alerting is wired up yet beyond the Blaze budget alert.

## Rollback

- Revert the commit and redeploy. The heartbeat change is backward compatible (older open tabs
  beating every 30 s still pass the rules); no data migration.
