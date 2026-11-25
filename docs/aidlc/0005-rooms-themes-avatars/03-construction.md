# 03 · Construction — Rooms, themes and avatars

## Increments

1. **Join notices** (`features/room/view-models/join-notices.ts`): the room VM hands each people
   list to `JoinNotices`, which announces new seats through the toast. The first list is
   everyone already there; a seat older than `JOIN_NOTICE_WINDOW_MS` is never announced.
   Covered by unit specs and the two-browser emulator journey.
2. **Themes** (ADR-0010): colour tokens became CSS variables with a dark map; `ThemeService` and
   `app-theme-toggle` in every page header; a no-flash script in `index.html`. The hero's floating
   notes moved to `app-hero-floats` to keep the hero stage under its 4 kB style budget. The e2e
   suite gained `theme.e2e.ts` (switch, reload, axe in dark on home, room and terms).

## Decision log

| Date       | Decision                                                        | Why                                                                                    |
| ---------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 2026-11-25 | Home page join toasts stay demo data; the room shows real joins | Owner's call: real names on the public home page would show strangers' names           |
| 2026-11-25 | People who arrive together share one toast                      | The toast shows one message at a time; separate ones would replace each other          |
| 2026-11-25 | Theme toggle talks to `ThemeService` without a view model       | App-wide setting, no other state; a VM would only pass the call along                  |
| 2026-11-25 | Announce only seats newer than one minute                       | Firestore may fill a listener from cache first, then the server; old seats aren't news |
