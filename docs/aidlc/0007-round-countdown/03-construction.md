# 03 · Construction — Round countdown

## Increments

1. **Data and rules:** `TIMER_LIMITS`, the room's `timerSeconds` and `lockOnTimeUp` (written on
   create, read with defaults for older rooms), `validTimer()` and `beforeTimeUp()` in the
   rules, and rules tests for the range, the lock, reset and lengthening, and older rooms.
2. **Countdown:** `Room.secondsLeft` / `isVotingLocked`, `TimerPhase`, `RoundCountdown` with its
   toasts, wired into the room view model (`canVote`, the tick) and the room prompt.
3. **Controls:** `RoomCommands.setTimerSeconds` (clamped, skipped when unchanged) and
   `toggleLockOnTimeUp`, the stepper and lock switch in moderator controls, the header's phase
   colours, the Warning toast tone and the Minus icon.
4. **Tests and docs:** unit specs for each piece, an e2e journey that uses Playwright's clock
   to run the minute in a moment, the rules tests in their own file (with shared fixtures), the
   data model and this record.

## Decision log

| Date       | Decision                                                                 | Why                                                                                                |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 2026-11-25 | The deadline is `roundStartedAt + timerSeconds`, not a stored end time    | "Reset timer" already restarts `roundStartedAt`; lengthening the countdown then needs one field    |
| 2026-11-25 | The rules enforce the lock, with 2 seconds of grace                       | Secrecy and fairness can't rely on the client (CLAUDE.md §3); the grace absorbs clock skew          |
| 2026-11-25 | Toasts only on a crossing seen between two ticks                          | Opening or reloading a room after time ran out shouldn't toast                                      |
| 2026-11-25 | A new length doesn't restart the toasts                                   | Lengthened past the warning it warns again on the way down; shortened into it, it warns at once     |
| 2026-11-25 | Seconds left never exceed the length                                      | The server stamps the round a moment after the tab's last tick, which showed 00:31 for 30 seconds    |
| 2026-11-25 | The flip stays allowed at zero                                            | The moderator can always reveal what was cast in time                                              |
| 2026-11-25 | Rules tests split into `rooms` and `countdown` files with shared fixtures | The single file went over the 300-line limit                                                       |
