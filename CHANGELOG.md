# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.1] — 2026-11-26

### Changed

- App Check now uses the **reCAPTCHA Enterprise** provider (Firebase "Fraud Defense") instead of
  the classic reCAPTCHA v3 provider, which Firebase has deprecated (ADR-0012). The deploy workflow
  passes the `FIREBASE_APP_CHECK_SITE_KEY` secret through to the runtime config, so a key set in CI
  reaches the live site. Still a no-op until the owner sets the key and turns on enforcement.

## [1.10.0] — 2026-11-26

### Security

- App Check (reCAPTCHA v3) support: when a site key is set in `runtime-config.js`, every Firestore
  and Auth request carries an attestation token, so only the real app can spend the project's quota
  — the defence against scripted abuse where there's no server to rate-limit (ADR-0012). Ships dark;
  the owner creates the key and turns on enforcement from the console.

## [1.9.0] — 2026-11-26

### Changed

- Presence heartbeat every 60 s instead of 30 s, and paused while the tab is hidden: a room costs
  far fewer Firestore reads (about 55–60 %), and a room left open in a background tab costs
  nothing. "Online" now means seen within 150 s.

### Fixed

- Mobile layout shift: a size-matched fallback font stops the page moving when the web fonts load,
  and the footer no longer appears before the page and gets pushed down (Lighthouse CLS 0).

### Security

- The site now sends security response headers (anti-clickjacking `X-Frame-Options`/`frame-ancestors`,
  `X-Content-Type-Options`, `Referrer-Policy`, HSTS, `Permissions-Policy`), from a full audit of the
  rules, auth, CSP, dependencies and the API (docs/aidlc/0010-performance-and-security).
- Hashed build files are cached for a year as `immutable`, so returning visitors don't re-fetch them.

## [1.8.0] — 2026-11-25

### Added

- The room tour explains the countdown and, for the moderator, how to settle an estimate
  (including typing the agreed value). It shows once more to moderators who saw the old tour.
- Tour keyboard support: the arrow keys move between steps, each step is announced, and closing
  the tour returns focus to the button that opened it (or to the tour button). Progress dots.

### Fixed

- Accessibility: the vote cards' names now include the value shown on them (voice control),
  the room has a main heading before its first story, the landing footer sits in a landmark,
  pages have a heading while loading, and the join form's tab panel uses an allowed role.
- The countdown shows its full length while no round is running, instead of ticking down.

### Changed

- The e2e accessibility scans also check WCAG 2.1 A and axe's best practices, and scan the join
  page.

## [1.7.0] — 2026-11-25

### Added

- **Settle on another value**: after the flip the moderator can type the estimate the team agreed
  on in discussion (another card, or a value outside the deck such as "6", up to 8 characters)
  and set it with "Set estimate" or Enter, instead of accepting the suggested card.

## [1.6.0] — 2026-11-25

### Added

- **Round countdown**: the timer counts down from one minute, turns amber with a warning toast
  at 20 seconds and red with a "time's up" toast at zero.
- **Lock voting at time up** (on by default): at zero the cards are disabled until the moderator
  presses "Reset timer". The Firestore rules refuse late votes too.
- The moderator sets the countdown from 00:30 to 10:00 in 30-second steps, and can turn the lock
  off so votes still count until the cards flip.

### Changed

- The header timer shows the time left instead of the time spent.

## [1.5.0] — 2026-11-25

### Added

- **Stories table** under the voting area: key, story and notes, status, estimate and rounds,
  with Active, Completed and All tabs, Download CSV, and an "Add story" button for the
  moderator. The moderator picks the next story from its row ("Vote", or "Re-estimate" for a
  settled one). On phones each story becomes a card.
- The Add story dialog lists every story added with "Add another", each with an animated tick,
  and has a red Close button. Closing with "Add story" confirms with a toast.

### Removed

- The narrow Stories side panel (replaced by the table).

## [1.4.1] — 2026-11-25

### Changed

- A smaller landing page hero: the title is 36 px on desktop (26 px on phones) on two balanced
  lines, and the introduction is 16 px, so the create form fits above the fold.

## [1.4.0] — 2026-11-25

### Added

- **Light and dark themes**: a switch in every page header (system, light, dark), remembered per
  browser, with no flash of the wrong theme on load.
- **Animal avatars**: 16 animals to pick on the create and join forms (a random one by default),
  shown on every seat. The Firestore rules accept only known avatar ids.
- **Facilitate without voting**: the organiser can run the session as a facilitator (ticked by
  default when creating a room) and switch to voting in the room; auto-reveal waits only for the
  players.
- **Add story dialog**: "Add story" in the top bar and on the empty table opens a dialog with the
  story line and optional notes; "Add another" keeps it open.
- **My rooms** (`/rooms`): every room this browser created or joined, with its code, your role
  and the last visit, to open or forget. A guest who comes back to the home page lands there.
- **A saved guest profile**: the create and join forms start with the name and avatar this
  browser last used.
- A notice that guest data (name, avatar, room list, moderator rights) lives in this browser.
- **CSV backup**: download a room from its Stories panel, or one room or all rooms from My rooms.
  UTF-8 with a header row, one row per story with the estimate and each voter's last revealed
  card; formula-like cells are defused. Built in the browser; nothing is uploaded.
- Join toasts in the room when a real person takes a seat ("Priya joined the room").
- `IFileSaver` port (browser download and in-memory adapters).

### Changed

- The room is redesigned: a light stage with the cards in the centre, and results that show the
  average, median, agreement, each person's card and a distribution coloured from low (green) to
  high (red), with grey for no vote.
- The Stories panel no longer has its own add field; adding goes through the dialog.
- A tighter landing page hero with a smaller title.

## [1.3.0] — 2026-11-25

### Added

- A guided tour of the room: a spotlight on each part and a card with Back, Next and Skip. It opens
  by itself once per browser for the room's moderator; anyone can replay it from the new "?" button
  in the top bar. Escape closes it.
- `IPreferenceStore` port (browser `localStorage` and in-memory adapters) to remember that the tour
  was shown.

### Changed

- The copyright footer is split: the notice on the left, "No account needed · Terms of use" on the
  right, lined up with each page's content width; centred on phones.

## [1.2.0] — 2026-11-25

### Added

- Copyright: `LICENSE` (© 2026 Ravi Akhouri, all rights reserved), a copyright footer on every
  page and a Terms of use page (`/terms`) that says no account is needed to use the app.
- "Add story" in the room's top bar and "Add a story" on the empty table, for the moderator: both
  move the cursor to the story field.
- `npm run start:live`: a development server against the real Firebase project, and
  `deploy:rules` now always targets the `live` project alias.

### Changed

- The card deck choice is collapsed by default and names the current deck; the moderator controls
  are more compact.
- The empty table has an icon and a clearer call to action.
- The room's top bar scrolls away on phones instead of staying stuck.

### Fixed

- Story rows in the Stories panel were clipped on the left and stacked vertically, because they
  shared a class name with Bootstrap's grid.

## [1.1.0] — 2026-11-25

### Added

- Landing page: create a room as a guest, join by code, how it works, features, comparison, FAQ.
- Join page behind a room's link: name, colour and player or spectator.
- Live planning room: stories, a table with seats, a private card deck, the flip, results
  (average, median, distribution, agreement, outlier hints), accept, vote again, skip, four decks,
  auto-reveal, round timer, players list and invite dialog with link and code.
- Firestore security rules with tests: votes are unreadable to others until the flip.
- Playwright suites: one browser on the Fake backend and two browsers against the emulators.

### Fixed

- The landing page's sample room code now uses only characters the app issues.
- The comparison table's scroll area is reachable by keyboard on phones.

## [1.0.0] — 2026-11-25

### Added

- Foundation: Angular 22 app, MVVM base classes, ports with Fake and Firebase adapters, design
  tokens, lint, unit, rules and e2e tooling, Azure Static Web Apps workflow, `api/` health function,
  CLAUDE.md and docs.
