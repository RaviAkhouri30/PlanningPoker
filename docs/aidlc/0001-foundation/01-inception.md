# 01 · Inception — Foundation

## Problem / goal

Start PlanningPoker, a real-time planning poker app with a modern look, on the same rules, tooling
and layout as the owner's `taal-yatra` project, so later features only add product code.

## User stories

- As the owner, I can run one command (`npm run verify`) that tells me the project is healthy.
- As a developer, I can run the whole app offline on a Fake backend.
- As a developer, I can test security rules and the real SDK on the local emulators.

## Acceptance criteria

- Angular 22 standalone, zoneless app with the reference's pinned versions, lint and TS settings.
- Ports with Fake and Firebase adapters for the store, auth and clipboard; lazy Firebase chunk.
- Design tokens and fonts from the design canvas.
- `firestore.rules` denies by default; emulator scripts use `demo-planning-poker`.
- CI workflow for Azure Static Web Apps written but not connected; `api/` with a health function.

## Units of work

Scaffold and configs · base classes · ports, adapters, factories, tokens · design system · CI and
`api/` · CLAUDE.md and docs.

## Risks & open questions

- Real-time Firestore differs from the reference's Firestore Lite → ADR-0006.
- No cloud resources are created without the owner's OK.
