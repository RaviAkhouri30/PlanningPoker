# 03 · Construction — Performance hardening and a security audit

## Increments

1. **Heartbeat.** `PAGE_VISIBLE` token (+ spec); `HEARTBEAT_INTERVAL_MS` 60 s and
   `ONLINE_WINDOW_MS` 150 s; `RoomViewModel.heartbeat()` switches on visibility and keeps to the
   minute from the last beat. Three new VM specs (hidden tab silent, beats on return once the
   minute passed, keeps to the minute when it hasn't).
2. **Fonts.** `styles/_fonts.scss` with the measured fallback faces; the token font stacks name
   them.
3. **Footer.** `router-outlet + app-site-footer { display: none }` in `styles/_base.scss`.
4. **Caching.** `immutable` one-year headers for the hashed files in `staticwebapp.config.json`.
5. **Security headers** (from the audit): `globalHeaders` in `staticwebapp.config.json` —
   `X-Frame-Options: DENY`, a header CSP `frame-ancestors 'none'; base-uri 'self'; object-src
   'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`,
   `Permissions-Policy`.

## Measured effect (local, Lighthouse 12.8.2, mobile, three runs each)

| Build            | Performance | CLS (layout shift)   |
| ---------------- | ----------: | -------------------- |
| 1.8.0 (before)   |   57–77     | 0.11 – 0.58          |
| this change      |   78–80     | **0** in all 3 runs  |

Served from a plain static server (no Brotli, no Azure), so the absolute score sits below the live
figure; the layout shift going to 0 is the point. LCP is unchanged (2.7 s render delay): the hero
text still paints only after the JS runs — prerendering is the fix and is left as a follow-up
(ADR needed). The heartbeat change is not visible to Lighthouse (a single page load); its effect
is the read counts in the performance report.

## Decision log

| Date       | Decision                                                            | Why                                                                            |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 2026-11-25 | Heartbeat 60 s, online window 150 s, silent while hidden            | ~55–60 % fewer reads; "online" stays honest; a backgrounded room costs nothing |
| 2026-11-25 | Keep the minute from the last beat on return, not an instant beat   | Flipping between tabs must not add writes                                      |
| 2026-11-25 | `PAGE_VISIBLE` as a token, not a `document` read in the VM          | Keeps the VM off the DOM and testable (CLAUDE.md §3, §7)                       |
| 2026-11-25 | Fallback fonts over `font-display: optional`                        | Keeps the real fonts, removes the swap's shift; no flash of invisible text     |
| 2026-11-25 | Hide the footer via a CSS sibling rule, no new state                | The router already orders outlet then footer; a pure-CSS fix is enough          |
| 2026-11-25 | Security headers in `globalHeaders`, HSTS without preload/subdomains | Close clickjacking/sniffing without a preload commitment the owner can't undo  |
| 2026-11-25 | No live DoS test against production                                  | It would deny service for real and spend the quota; exposure reasoned instead   |
