# 04 · Verification — Performance hardening and a security audit

## Performance / functional checks

| Check                        | Result                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| `npm run verify`             | ✔ (format, lint, diagrams, typecheck, coverage, api, build)        |
| `npm run e2e`                | ✔ 48/48 (desktop, tablet, mobile; axe scans clean)                 |
| `npm run test:rules`         | ✔ (rules unchanged; re-run to back the audit below)                |
| Lighthouse mobile CLS        | 0.11–0.58 → **0** (three runs)                                     |
| Fonts / footer               | Correct stacks; footer shows once the route renders (browser check) |

# Security audit

Scope: `firestore.rules`, Firebase Auth, the client (XSS sinks, secrets), the CSP, the Azure
Functions in `api/`, dependencies, and denial-of-service / denial-of-wallet exposure. No live
attack was run against production; availability tests would have denied service for real and spent
the quota, so DoS is reasoned from the architecture and the load test in the performance report.

## What an attacker can and cannot do

Everyone is an anonymous Firebase guest. A room is private by its unguessable id/link
(slug + 6 chars of a 31-letter alphabet ≈ 887 M per name; listing is denied). Within that:

| Attempt                                                        | Rules outcome | Why                                                                                     |
| ------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| Read someone else's vote before the flip                      | **Denied**    | `votes/{uid}` get needs `isUser(uid)` or `rounds/{round}` to exist; the marker is the flip |
| List a round's votes before the flip                          | **Denied**    | `list` needs the round marker, created only by the moderator at reveal                   |
| Cast or change another person's vote                          | **Denied**    | write path is `votes/{uid}` under `isUser(uid)`                                          |
| Vote as a spectator, or with a card not in the deck           | **Denied**    | role and `value in deckCards(deck)` checked                                              |
| Vote after time-up with the lock on                           | **Denied**    | `beforeTimeUp` (2 s grace) in `roundIsOpen()`                                            |
| Take over a room (become its moderator)                       | **Denied**    | `moderatorUid` set at create to the caller, never in `changedOnly(...)` after           |
| Edit the room, stories or reveal as a non-moderator           | **Denied**    | `isModerator(roomId)` on every such write                                               |
| Forge the reveal marker to unlock votes                       | **Denied**    | `rounds` create needs `isModerator` and the room already `revealed == true`             |
| Create a room/seat/story with extra or oversized fields       | **Denied**    | `hasOnly(keys)` + `isText(min,max)` + typed/ranged checks on every document             |
| Inject HTML/script through a name, story or estimate          | **Mitigated** | No `innerHTML` / `bypassSecurityTrust` anywhere; Angular escapes bindings; CSP blocks inline |

The rules deny by default and every allow/deny has a test in `tests/rules` (re-run above).

## Findings and fixes

| # | Severity | Finding                                                                 | Status |
| - | -------- | ----------------------------------------------------------------------- | ------ |
| 1 | Medium   | No security response headers (clickjacking, MIME sniffing, no HSTS)     | **Fixed** — `globalHeaders` in `staticwebapp.config.json` (X-Frame-Options DENY, CSP `frame-ancestors 'none'`, nosniff, Referrer-Policy, HSTS, Permissions-Policy) |
| 2 | Medium   | DoS / denial-of-wallet: anonymous guests can spam room/vote writes; no rate limit in front of Firestore | **Mitigated by design + owner actions** — see below; not fixable in rules |
| 3 | Low      | Any signed-in guest can read a room's participant display names if they have the room id | **Accepted** — by design (the join page shows who's in a room); names are user-chosen, so advise against real names in the UI copy later |
| 4 | Low      | Dev-only dependency advisories (`@hono/node-server`, `@opentelemetry/core`, moderate) | **Noted** — not in the app or API bundle (`npm audit --omit=dev` = 0); `npm audit fix` is the owner's call against the pinned toolchain |

Passed with no change: CSP script-src (`strict-dynamic` + hashes; `https:`/`unsafe-inline` are
ignored by browsers that honour strict-dynamic), secret handling (`runtime-config.js` git-ignored,
no service-account files tracked, no API keys in source), the Azure Functions (errors return a
generic message, never a stack or a token), production `npm audit` (0), and input validation
(client limits mirror the rules).

## DoS / DDoS exposure (finding 2)

- **Static hosting** absorbs floods well: Azure served 14,000 requests, 200 concurrent, 0 errors
  (performance report). A volumetric DDoS on the pages is Azure's to absorb; the Free plan has no
  WAF, so a very large attack would be mitigated by moving to Standard + Azure Front Door.
- **The real exposure is the data layer.** Nothing rate-limits writes in front of Firestore, and
  anonymous sign-in is open (100 new accounts/hour/IP). A script could burn the day's 20,000
  writes / 50,000 reads cheaply and take rooms down until the reset — and on Blaze, run up a bill
  (denial of wallet).
- **What limits the damage today:** the Spark plan's hard daily cap means the worst case is an
  outage until the reset, at zero cost. Field-size and shape limits in the rules keep each write
  small. Room ids/codes are unguessable, so an attacker can only hammer their own rooms, not
  disrupt a specific team's room without its link.
- **Owner actions before the LinkedIn launch** (recorded in `05-operations.md`): turn on **App
  Check** (reCAPTCHA) so only the real app can talk to Firestore; move to **Blaze with a budget
  alert** so a spike pages you instead of silently failing; keep anonymous sign-in but watch the
  Auth abuse metrics. These are console/billing actions, not code.
