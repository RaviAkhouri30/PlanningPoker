# 03 · Construction — Manual estimate

## Increments

1. **Form:** `app-custom-estimate` under the moderator's choices in the results panel.
2. **Command:** `RoomCommands.accept` checks the value; `LIMITS.estimate`.
3. **Tests and docs:** component, results panel and command specs; an e2e step that sets "6"
   and finds it in the Completed tab; component tree and this record.

## Decision log

| Date       | Decision                                         | Why                                                                         |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| 2026-11-25 | Free text up to 8 characters, not only deck cards | Teams agree on values outside the deck ("6", "XL+"); the rules already allow it |
| 2026-11-25 | Always shown under the choices, not behind a toggle | One step fewer, and it's clearly the fallback under the suggested card     |
| 2026-11-25 | Its own component                                | The results panel's styles are at the 4 kB budget                           |
