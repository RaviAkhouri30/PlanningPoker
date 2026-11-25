# ADR-0007: Anonymous guests first, accounts later

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.1.0

## Context

The main promise is "join with just a name". Accounts (email, Google, GitHub) need providers set up in a real Firebase project.

## Decision

Guests sign in with Firebase anonymous auth and set a display name. The session persists in the browser, so a refresh keeps the seat and the moderator role. Accounts arrive later and will link the anonymous user so the uid, and its rooms, are kept.

## Consequences

- Every rule can rely on `request.auth` being set; nothing is readable signed out.
- A guest who clears site data loses the moderator role for their rooms.
- The real project must have the Anonymous provider turned on.
