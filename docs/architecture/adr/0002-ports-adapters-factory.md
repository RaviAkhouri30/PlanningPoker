# ADR-0002: Ports, adapters and a factory per port

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

Unit tests, `npm start` and the deterministic e2e suite must run without Firebase, while the emulator and production use the real SDK. SDK types must not spread through features.

## Decision

Features depend on abstract-class ports (`IRealtimeStore`, `IAuthService`, `IClipboardService`) used as DI tokens. Factories in `core/factories` pick a Fake or Firebase adapter from `APP_ENVIRONMENT.backend`. Only `core/backends` imports `firebase/*`, loaded lazily through `*_GATEWAY_LOADER` tokens.

## Consequences

- The whole app runs in memory for development and e2e; Firebase code is one lazy chunk.
- Fakes must honour the same contract as the real adapters (Liskov), including batch atomicity.
- A second implementation of a port means a new adapter, not a branch in feature code.
