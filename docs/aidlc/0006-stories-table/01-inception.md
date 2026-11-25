# 01 · Inception — Stories table

Requested by the owner on 2026-11-25.

## Problem / goal

The stories sat in a narrow side panel, so titles were cut off and notes, rounds and status were
hard to see. "Add another" in the Add story dialog only showed one line of text, so it wasn't
clear what had been added, and there was no obvious way to close the dialog.

## User stories

1. As anyone in the room, I see the stories in a proper table under the voting area: key, story
   and notes, status, estimate and rounds, filtered by Active, Completed or All.
2. As the moderator, I add stories from an "Add story" button on the table and pick the next story
   from its row ("Vote", or "Re-estimate" for a settled one).
3. As the moderator, after "Add another" I see every story I've added since opening the dialog,
   each with an animated tick, in a toast-like panel under the buttons.
4. As the moderator, I can close the dialog with a clear red Close button.

## Acceptance criteria

- The side panel is gone; the table sits under the cards, full width of the main column.
- The story being voted on is highlighted and marked "Voting"; others read "To estimate",
  "Estimated" or "Skipped"; estimates show as a chip; "–" when there's none.
- Phones: each row becomes a card (key and story, then status, estimate and rounds side by side,
  then the action); column names stay available to screen readers.
- The dialog lists the stories added with "Add another" ("2 stories added"), announced to screen
  readers; the ticks pop in and honour reduced motion. The list clears when the dialog closes.
- "Add story" (closing the dialog) confirms with a toast: "Story added: <title>".
- Light and dark themes; axe clean; Download CSV still on the table.

## Units of work

Stories table component and row model · dialog list, red Close and toast · e2e and docs.

## Risks & open questions

- The dialog lists a story when it is sent, before the write lands. A failed write still shows
  the room's error toast once the dialog closes.
- A toast can't show over a native modal dialog (the backdrop covers it), so the open dialog
  shows its own list instead.
