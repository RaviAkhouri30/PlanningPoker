# ADR-0004: Bootstrap 5.3 grid and utilities only

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

The design canvas defines its own look; we only need a responsive grid and spacing utilities. Bootstrap 6 is in alpha.

## Decision

Import Bootstrap 5.3.8 SCSS selectively (grid, utilities, reboot). All colours, type and spacing come from design tokens in `src/styles`; components never hard-code them.

## Consequences

- Small CSS, consistent breakpoints.
- Upgrading to Bootstrap 6 needs a stable release and a new ADR.
