# ADR-0008: Votes stay secret until the flip, enforced by rules

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.1.0

## Context

Hiding cards only in the UI lets anyone read them with dev tools before the flip, which defeats planning poker. Rules can't count votes or reveal fields selectively.

## Decision

Votes live in `rooms/{id}/rounds/{round}/votes/{uid}`. You can always read your own; others' become readable only once `rounds/{round}` exists, which the moderator creates in the same batch that sets `revealed: true`. A vote is written together with the voter's `votedRound`, so everyone sees who has voted without seeing what. Auto-reveal therefore runs in the moderator's tab.

## Consequences

- Secrecy holds even against a modified client; `tests/rules` proves it.
- A new round is `round + 1`; nothing is deleted, and old rounds remain for the summary.
- If the moderator's tab is closed, auto-reveal waits for them (documented limitation).
