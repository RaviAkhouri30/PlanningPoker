# PlanningPoker

Real-time planning poker for agile teams. Create a room with just your name, share the link, vote
in private, flip the cards together and settle the estimate — no sign-up needed.

- **Angular 22** (standalone, zoneless, signals) · **Firebase** (Firestore real-time + anonymous
  Auth) · **Azure Static Web Apps** with Azure Functions.
- Votes stay secret until the flip, enforced by Firestore security rules, not just the UI.

## Quick start

```bash
nvm use
npm ci
npm start               # http://localhost:4200 on the in-memory Fake backend
```

Against the local Firebase emulators (needs Java 21+):

```bash
npm run emulators       # in one terminal
npm run start:emulator  # in another
```

## Checks

```bash
npm run verify          # format, lint, diagrams, typecheck, unit coverage, api tests, build
npm run e2e             # Playwright on the Fake backend, 3 viewports
npm run test:rules      # firestore.rules on the emulator
npm run e2e:firebase    # two browsers against the emulators
```

## Docs

- [CLAUDE.md](CLAUDE.md) — the engineering rules (mandatory).
- [docs/](docs/README.md) — architecture, data model, ADRs, AIDLC records.
- [CHANGELOG.md](CHANGELOG.md)
