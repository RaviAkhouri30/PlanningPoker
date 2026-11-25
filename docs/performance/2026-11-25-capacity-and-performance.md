# Capacity and performance — 2026-11-25 (v1.8.0)

How much traffic PlanningPoker can take on the free tiers (Azure Static Web Apps Free, Firebase
Spark), where it breaks, how fast it is, and what Google AdSense would need.

## Summary

- **The breaking point is the Firestore free quota, not the website.** A room's reads grow with
  the square of the people in it (every 30-second heartbeat and every vote is delivered to every
  open tab). The Spark plan's 50,000 reads a day covers about **five one-hour sessions of eight
  people a day**. A single 20-person session uses it up in under an hour. After that, rooms stop
  loading and updating until the quota resets (midnight Pacific, 13:30 IST).
- **Hosting is not a concern.** Azure served 14,000 requests up to 200 at a time with no errors;
  the 100 GB a month allowance is roughly 280,000 first-time visits.
- **The app itself copes with 100 people in a room**: the cards flip 0.7 s after the last vote,
  with almost no main-thread work and about 42 MB of memory.
- **Lighthouse:** desktop 97 / 100 / 100 / 100; mobile **72** / 100 / 100 / 100 (target 95), held
  back by a font swap that moves the page and by rendering only after the JavaScript runs.

## Free-tier limits that apply

| Service                          | Free limit                                                         | What happens past it                     |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| Azure Static Web Apps (Free)     | 100 GB bandwidth a month (per subscription), 250 MB per app, no SLA | No overage on Free: upgrade to Standard  |
| Cloud Firestore (Spark)          | 50,000 reads, 20,000 writes, 20,000 deletes a day; 1 GiB stored     | Reads or writes refused until the reset  |
| Firebase Auth (anonymous)        | 100 new accounts an hour **per IP address**                         | Sign-in refused from that IP for the hour |

Blaze (pay as you go) keeps the same free quota each day and then charges about $0.03 per
100,000 reads and $0.09 per 100,000 writes (us-central1; other regions differ a little).

## How a room uses Firestore

From the code and measured on the emulators (simulated guests with the real SDK, counting the
documents each listener receives). N is everyone with the room open.

| Event                      | Writes      | Reads (billed)  | Measured (guests only)                    |
| -------------------------- | ----------- | --------------- | ----------------------------------------- |
| N people join              | N           | ≈ N²            | 10 → 140, 25 → 725, 50 → 2,700            |
| One heartbeat (every 30 s) | N           | ≈ N²            | 10 → 110, 25 → 650, 50 → 2,448            |
| One round (vote and flip)  | 2N + 3      | ≈ 2N²           | 10 → 220, 25 → 1,300, 50 → 4,949          |

An hour-long session with 15 rounds: **reads ≈ 150 N², writes ≈ 150 N**. Heartbeats are about
80 % of the reads.

| People in the room | Reads per hour | Share of the free day | Sessions a day on Spark | Cost per session on Blaze |
| -----------------: | -------------: | --------------------: | ----------------------: | ------------------------: |
|                  5 |          3,750 |                   8 % |                      13 |                  ≈ $0.002 |
|                  8 |          9,600 |                  19 % |                       5 |                  ≈ $0.004 |
|                 10 |         15,000 |                  30 % |                       3 |                  ≈ $0.006 |
|                 15 |         33,750 |                  68 % |                       1 |                  ≈ $0.012 |
|                 20 |         60,000 |                 120 % |   0 (runs out in ~50 min) |                  ≈ $0.021 |
|                 50 |        375,000 |                 750 % |   0 (runs out in ~8 min) |                   ≈ $0.12 |

Writes are not the limit: a 10-person session writes about 1,500 an hour (13 hours of the free
20,000).

## Room size stress test (emulators)

One real moderator browser (Chromium, 1440 × 900) and N simulated guests joining in waves of ten,
sending a heartbeat, then all voting at once with auto-reveal on.

| Guests | All seated on the moderator's screen | Votes committed | Flip shown after the last vote | Main-thread long tasks | JS heap |
| -----: | -----------------------------------: | --------------: | -----------------------------: | ---------------------: | ------: |
|      5 |                               0.2 s  |          0.1 s  |                          0.8 s |                   0 ms |   35 MB |
|     10 |                               0.2 s  |          0.1 s  |                          0.8 s |                   0 ms |   37 MB |
|     25 |                               0.4 s  |          0.3 s  |                          1.0 s |                   0 ms |   37 MB |
|     50 |                               1.7 s  |          0.9 s  |                          0.7 s |                   0 ms |   45 MB |
|    100 |                               7.7 s  |          4.8 s  |                          0.7 s |                 121 ms |   42 MB |

The flip includes the deliberate 0.7 s auto-reveal pause. The slower joins and commits at 100
come from running 100 SDK clients and the emulator on one laptop; the moderator's page stayed
responsive throughout and the table laid out 100 seats correctly. At the 100 run the counters
missed some deliveries, so its read counts are left out of the table above.

## Static hosting load test

ApacheBench against `https://www.planningpoker.in/` (Brotli), 2,000 to 4,000 requests per step:

| Concurrent | Requests/s | Median | 99th percentile | Failed |
| ---------: | ---------: | -----: | --------------: | -----: |
|         10 |         24 | 401 ms |          466 ms |      0 |
|         50 |         97 | 487 ms |          651 ms |      0 |
|        100 |        122 | 760 ms |        1,152 ms |      0 |
|        200 |        139 | 1,291 ms |      2,311 ms |      0 |

Throughput levelled off because of the test client (one machine, a new TLS connection per request
at about 0.4 s each from India), not the server. Nothing failed. The real hosting limit is the
monthly bandwidth: a first visit downloads about 150 KB from Azure for the landing page and about
200 KB more for a room (the Firebase SDK is most of it), so 100 GB is roughly 280,000 first visits
a month; returning visitors cost far less.

## Lighthouse (live site)

| Page          | Performance | Accessibility | Best practices | SEO | FCP   | LCP   | TBT    | CLS   |
| ------------- | ----------: | ------------: | -------------: | --: | ----- | ----- | ------ | ----- |
| Landing, mobile  |       72 |           100 |            100 | 100 | 2.2 s | 3.4 s | 100 ms | 0.346 |
| Landing, desktop |       97 |           100 |            100 | 100 | 0.7 s | 1.0 s | 0 ms   | 0.069 |

Causes on mobile and fixes, by impact (1 and 3 are **done** in the 1.9.0 change,
AIDLC 0010; measured layout shift is now 0):

1. **Layout shift 0.35** (good is under 0.1): the Space Grotesk heading font arrived late and
   moved the page (0.24), and the footer rendered first and was pushed down (0.11). **Fixed:**
   size-matched fallback fonts (`size-adjust`) and the footer hidden until the routed page exists.
2. **LCP 3.4 s**, of which 2.7 s is render delay: the page is drawn only after the JavaScript
   runs. Fix (follow-up): prerender the landing page at build time (Angular static generation),
   which needs an ADR.
3. **Caching**: hashed JS and CSS files were served with `max-age=30, must-revalidate`, so
   returning visitors re-checked every file. **Fixed:** hashed files are cached for a year
   (`immutable`) in `staticwebapp.config.json`.
4. Smaller: about 22 KB of unused JavaScript and 14 KB of unused CSS on the landing page.

## Before sharing on LinkedIn

1. **Move Firebase to Blaze with a budget alert** (owner action). Without it, a handful of busy
   sessions stops every room for the rest of the day. Even 1,000 ten-person session-hours a month
   would cost about $6.
2. **Cut the heartbeat cost** — **done** (1.9.0): the heartbeat is now 60 s and silent while the
   tab is hidden, roughly 55–60 % fewer reads, so the per-room figures above are conservative for
   a mix of active and backgrounded tabs.
3. **Fix mobile performance** — items 1 and 3 **done** (1.9.0, layout shift now 0); prerendering
   (LCP) is a follow-up needing an ADR.
4. **Turn on App Check** and check the authorised domains (owner action), so nobody else can spend
   the quota — see the security audit below.
5. **Security headers** — **done** (1.9.0): anti-clickjacking, nosniff, HSTS and more.

## Security audit

A full security audit (rules, auth, CSP, dependencies, the API, and DoS/DDoS exposure) is in
[`docs/aidlc/0010-performance-and-security/04-verification.md`](../aidlc/0010-performance-and-security/04-verification.md).
In short: the Firestore rules hold (vote secrecy, moderator immutability, per-seat ownership, no
over-posting), there is no XSS sink and no secret in source, and the production bundle has no known
vulnerabilities. Fixed in 1.9.0: the missing security response headers. The one exposure that is
not a code fix is **denial-of-service / denial-of-wallet** — nothing rate-limits writes in front of
Firestore, so a script could exhaust the day's quota (an outage until reset on Spark, a bill on
Blaze); App Check plus a Blaze budget alert are the owner-side defences, and the free quota caps
the worst case at an outage, not a cost. No live attack was run against the site.

## Google AdSense: what it needs

- **Account and review:** an AdSense account (18 or over), the site submitted for review. Tool
  sites with little text are often refused as "low value content", so the landing page's features
  and FAQ help, and a few useful articles (how to run planning poker, estimation tips) would help
  more.
- **`ads.txt`** at the site root with the publisher ID, once approved.
- **Consent:** for visitors in the EEA, the UK and Switzerland, a Google-certified consent
  platform is required for personalised ads; Google's own "Privacy & messaging" message
  qualifies and is free.
- **Privacy and terms:** say that Google and its partners use cookies to show ads, with a link to
  how Google uses data.
- **Content Security Policy:** the app's strict policy (hashes plus `strict-dynamic`) would allow
  the ad script if the app loads it, but Google only supports a nonce-based strict policy and may
  need `unsafe-eval`; this needs testing and a recorded security decision.
- **Placement:** landing page, My rooms and the legal pages. Not inside a room: ads next to the
  cards invite accidental clicks (against AdSense policy) and distract the vote.
- **Performance:** ads usually cost Lighthouse points (third-party scripts and cookies). Load the
  script after the page is idle and reserve each slot's size so nothing jumps.
- **Earnings:** they depend heavily on visitors' countries and the niche; a small tool site usually
  earns a few dollars per thousand page views. With hosting free and Firestore at about a cent per
  session, even modest traffic would cover the running costs.
- **In the code:** an ads port with a browser adapter (loads the script lazily, only with a
  publisher ID in `runtime-config.js` and consent) and a no-op Fake, and an ad-slot component; off
  until the publisher ID is set.

## Sources

- [Quotas in Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/quotas)
- [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) ·
  [Firestore usage and limits](https://firebase.google.com/docs/firestore/usage) ·
  [Firestore pricing](https://cloud.google.com/firestore/pricing)
- [Firebase Auth limits](https://firebase.google.com/docs/auth/limits)
- [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en) ·
  [Consent requirements for the EEA, UK and Switzerland](https://support.google.com/adsense/answer/13554116?hl=en) ·
  [AdSense and Content Security Policy](https://support.google.com/adsense/answer/16283098?hl=en)
