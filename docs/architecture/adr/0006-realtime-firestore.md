# ADR-0006: Real-time Firestore behind IRealtimeStore

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.1.0

## Context

The reference project reads with Firestore Lite (one-off reads). Planning poker needs every browser to see votes, flips and stories as they happen.

## Decision

Use the full Firestore SDK with `onSnapshot` listeners, behind a small port: `watchDocument`, `watchCollection(path, orderBy?)` and `commit(writes)` (one atomic batch). The SDK is still lazy-loaded. Server timestamps cross the port as the `SERVER_TIME` sentinel.

## Consequences

- A room is a handful of small documents; the room view model combines them with `combineLatest`.
- Multi-document changes are always one batch, which the rules verify with `getAfter`/`existsAfter`.
- Firestore keeps a listen channel open, so e2e tests wait for `load`, never `networkidle`.
- Larger bundle than Firestore Lite, loaded only on the join and room pages.
