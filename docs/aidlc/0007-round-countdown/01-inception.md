# 01 · Inception — Round countdown

Requested by the owner on 2026-11-25.

## Problem / goal

The room's timer counted up from the start of the round, so nobody knew how long was left and
nothing happened when the time was up. The owner wants a countdown that warns, closes voting at
zero, and that the moderator controls.

## User stories

1. As anyone in the room, I see the round count down from one minute to 00:00.
2. As anyone in the room, I get a warning toast when 20 seconds are left and a "time's up" toast
   at zero.
3. As the moderator, when time is up voting freezes until I press "Reset timer", which opens it
   again with the full countdown.
4. As the moderator, I can make the countdown longer (or shorter) for the room.
5. As the moderator, I can choose whether voting freezes at zero, or keeps going until the flip.

## Acceptance criteria

- Default one minute; the moderator steps it by 30 seconds between 00:30 and 10:00.
- The timer turns amber for the last 20 seconds and red at zero; idle (no story, or cards
  flipped) it shows the full length.
- The warning and time-up toasts show once, only for a crossing seen live (opening a room whose
  time ran out long ago stays quiet).
- Lock on (default): at zero the cards are disabled, the prompt says voting is closed ("Reset the
  timer to open voting again" for the moderator), and "Reset timer" is highlighted. The rules
  refuse votes cast, changed or taken back after time is up, so it holds for every client.
- Lock off: the time-up toast says votes still count until the cards flip.
- Lengthening the countdown re-opens a locked round if the new length leaves time.
- Rooms created before this change count down from one minute with the lock on.
- Light and dark themes, axe clean, reduced motion honoured.

## Units of work

Room fields and rules · countdown model and toasts · moderator controls and header · tests and docs.

## Risks & open questions

- The clock is each browser's; the rules use the server's. The rules allow a 2-second grace so a
  vote sent in the last second isn't refused for clock skew. A browser with a clock far off can
  show the wrong time left; the server still decides.
- Flipping the cards is not blocked at zero: the moderator can always reveal what was cast.
