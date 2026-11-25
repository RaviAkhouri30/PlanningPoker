# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
