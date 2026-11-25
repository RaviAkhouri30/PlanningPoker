# ADR-0003: Signals for state, RxJS for async, no Promises

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

Real-time listeners, timers, retries and ordered writes are streams. Mixing Promises and streams in app code makes cancellation and ordering hard to reason about.

## Decision

State is held in signals; all asynchronous work is RxJS. `Promise`, `async`/`await` and `.then()` are banned in app code by lint, except in `core/backends` (wrapped with `defer`) and `main.ts`. Tests may use Promises.

## Consequences

- Listeners map naturally to `Observable`s with teardown.
- Room commands run through one `concatMap` queue, so a vote and its retraction never race.
- Contributors need to be comfortable with RxJS operators; non-obvious choices are commented.
