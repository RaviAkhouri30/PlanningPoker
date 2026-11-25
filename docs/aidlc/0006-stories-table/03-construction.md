# 03 · Construction — Stories table

## Increments

1. **Row model**: `StoryRowStatus` and `storyRows()`, with specs.
2. **Stories table**: `app-stories-table` under the poker table; tabs, CSV and Add story in its
   header bar; Vote and Re-estimate per row for the moderator; a card per row on phones. The side
   panel and its spec were removed; the tour's Stories step now points at the table.
3. **Add story dialog**: the added-stories panel with popping ticks, a red Close button, and a
   phone layout with the two add buttons side by side and Close under them. The room toasts
   "Story added" when the dialog is closed.
4. **Tests and docs**: specs for the table, row model, dialog list and toast rule; the e2e
   journey adds two stories with "Add another", checks the list, closes with the red button and
   picks the next story from the table; component tree and overview updated.

## Decision log

| Date       | Decision                                                            | Why                                                                              |
| ---------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 2026-11-25 | Picking a story is a button per row, not a clickable row            | Buttons are reachable by keyboard and named for screen readers ("Vote: Refunds") |
| 2026-11-25 | Settled stories offer "Re-estimate"                                 | Selecting one already reopens it (`ModerationService.select`); the label says so |
| 2026-11-25 | The open dialog lists what was added; the toast comes after closing | A native modal covers toasts with its backdrop                                   |
| 2026-11-25 | On phones the header row is visually hidden, not `display: none`    | `display: none` removed it from the accessibility tree, losing the column names  |
