# 01 · Inception — Performance hardening and a security audit

Requested by the owner on 2026-11-25, before sharing the site on LinkedIn: "how much traffic it
can handle… a performance test and the breaking point… act as an ethical hacker, is the website
hackable, can it be hit by DDoS, a complete security audit, and fix what's found."

The capacity and performance findings are in
[`docs/performance/2026-11-25-capacity-and-performance.md`](../../performance/2026-11-25-capacity-and-performance.md);
the security findings are in [`04-verification.md`](04-verification.md). This record covers the
fixes that came out of them.

## Problem / goal

1. **Cost and quota.** Every heartbeat is read by every open tab, so presence is most of a room's
   Firestore reads (about 80 %). On the free Spark plan that caps the day at roughly five
   eight-person sessions. Halve the heartbeat without making "online" dishonest, and stop a room
   left open in a background tab from spending anything.
2. **Mobile performance.** Lighthouse mobile was 72, held back by a 0.35 layout shift: the
   heading font arrives late and moves the page, and the footer renders before the routed page
   and is pushed down. Returning visitors also re-check every build file (30 s cache).
3. **Security.** A full audit of the rules, auth, CSP, dependencies, the Azure Functions and
   input handling, plus an honest read of the denial-of-service / denial-of-wallet exposure, with
   fixes for anything real.

## User stories

1. As the owner, a room left open in a background tab costs nothing, and a busy day on the free
   tier goes further.
2. As a visitor on a phone, the landing page doesn't jump while it loads.
3. As a returning visitor, the app's unchanged files load from cache, not the network.
4. As the owner, I know what an attacker can and cannot do, and the real holes are closed.

## Acceptance criteria

- Heartbeat every 60 s while visible, nothing while hidden; "online" window widened to 150 s so a
  visible tab is never wrongly shown as away. Rules still accept the write.
- Lighthouse mobile layout shift under 0.1 (measured 0 after the fix); desktop stays ≥ 95.
- Hashed build files served `immutable` for a year; `index.html` and `runtime-config.js` stay
  uncached, so a deploy still shows up within a minute.
- The security audit has a test or a cited check behind every "allow" and every "deny" claim;
  fixes land with tests; `npm audit` shows no high or critical.
- No live DoS/DDoS attack is run against the production site (it would deny service for real and
  burn the quota); exposure is reasoned from the architecture and the load test already done.

## Risks & open questions

- Prerendering the landing page would cut the 2.7 s render delay (LCP), but it needs Angular
  static generation and an ADR; left as a follow-up, not in this change.
- The free tier has no request rate limiting in front of Firestore; App Check and a Blaze budget
  alert are owner actions, recorded in [`05-operations.md`](05-operations.md).
