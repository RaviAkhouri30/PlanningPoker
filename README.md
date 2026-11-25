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

Against the real Firebase project (see [docs/tooling.md](docs/tooling.md)):

```bash
npm run start:live      # reads public/runtime-config.js
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

## License

© 2026 Ravi Akhouri. All rights reserved. This is proprietary software, not open source: see
[LICENSE](LICENSE). Using the hosted app is covered by its Terms of use (`/terms`).
