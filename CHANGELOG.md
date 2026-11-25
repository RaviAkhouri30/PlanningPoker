# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
