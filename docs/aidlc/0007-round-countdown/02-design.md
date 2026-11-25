# 02 · Design — Round countdown

```mermaid
flowchart TB
  vm[RoomViewModel] -- "tick every second: now + check()" --> cd[RoundCountdown]
  cd -- "label, phase" --> header[room-header: role=timer, data-phase]
  cd -- "locked" --> deck[canVote: card deck disabled]
  cd -- "warning / time up" --> toast[ToastService: Warning tone]
  controls[moderator-controls] -- "timerChange(seconds), lockToggle" --> cmds[RoomCommands]
  controls -- "resetTimer" --> cmds
  cmds --> mod[ModerationService.update]
  mod --> store[(rooms/roomId: timerSeconds, lockOnTimeUp, roundStartedAt)]
  store -- "rules: beforeTimeUp(room)" --> votes[(rounds/round/votes)]
```

- **Data:** the room gains `timerSeconds` (int 30–600, default 60) and `lockOnTimeUp` (bool,
  default true). The deadline is `roundStartedAt + timerSeconds`. "Reset timer" sets
  `roundStartedAt` to the server time, as it did before.
- **Model:** `Room.secondsLeft(now)` (rounded up, between 0 and the length) and
  `Room.isVotingLocked(now)`.
- **`RoundCountdown`** (view-model helper, `view-models/round-countdown.ts`): `secondsLeft`,
  `label`, `running` (a story is active and the cards aren't flipped), `phase` (`TimerPhase`:
  idle, running, warning, up) and `locked`. `check()` runs on every tick and toasts only on a
  crossing seen between two ticks of the same round (keyed by round and start time).
- **UI:** the header timer reads "Time left" and takes `timerPhase` for its colour. Moderator
  controls gain a Countdown stepper (−/+ 30 s, disabled at the limits) and a "Lock voting at
  time up" switch; "Reset timer" turns red while voting is locked.
- **Rules:** `validTimer()` on create and update; `beforeTimeUp(room)` joins `roundIsOpen()`, so
  votes are refused after the deadline plus 2 seconds while the lock is on.
- **Tokens:** `warning-wash`, `warning-text`, `danger-wash`, `danger-text` (light and dark).
- **Toasts:** a new `ToastTone.Warning`; the toast sets `data-tone` for its icon colour.

```mermaid
sequenceDiagram
  actor Alex as Alex (moderator)
  actor Maya
  participant Store as Firestore
  Note over Alex,Maya: each tab ticks once a second
  Maya-->>Maya: 00:20, toast "20 seconds left to vote"
  Maya-->>Maya: 00:00, toast "Time’s up", deck disabled
  Maya->>Store: vote after time up
  Store-->>Maya: permission-denied (beforeTimeUp)
  Alex->>Store: Reset timer: room.roundStartedAt = server time
  Store-->>Maya: room changed, countdown back to 01:00, deck enabled
```
