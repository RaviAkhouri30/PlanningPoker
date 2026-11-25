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
3. **Light stage and coloured results**: the dark table is gone. `app-poker-table` is a light
   stage: the players in one row, then the deck (projected by the page, hidden after the flip),
   then the vote count; after the flip the results take the deck's place. `Deck.bandOf()` splits
   the number cards into thirds; seats show a coloured edge on their flipped card and the chart's
   bars use the same colours, with a grey "No vote" bar and a legend.
4. **Facilitator mode**: "I'm facilitating and won't vote" on the create form seats the organiser
   as a spectator; "I vote too" in the moderator controls switches back and forth
   (`ParticipantsService.setRole`, allowed by the existing rules for one's own seat). Auto-reveal
   already counts players only. The two-browser emulator journey checks the cards flip once the
   only player votes.
5. **Animal avatars**: 16 flat faces (`animals.constants.ts`) drawn as SVG paths, one per colour
   layer, so the avatar never needs `innerHTML`; their colours are `animal-*` tokens.
   `app-avatar` draws the face when it has an `animal`, else initials (seats from before this
   release). `app-avatar-picker` (shared, presentational) shows the pick and opens a grid of all
   sixteen; the landing and join forms start on a random animal (`RANDOM`), and the organiser's
   seat takes the colour their animal suits. Seats store `avatar`; `firestore.rules` accepts it
   only from the list and still accepts seats without one. The rules tests, the Fake e2e (pick on
   the home page, see it in the room) and the two-browser journey (the guest's pick reaches the
   moderator) cover it.
6. **Add story dialog**: "Add story" in the header and on the empty table opens
   `app-add-story-dialog`, a native modal with the story line (ticket key and title) and optional
   notes, which are saved as the story's description. "Add another" keeps it open with the cursor
   back in the field and says what was added. The Stories panel lost its own field. The open and
   close logic moved from the invite dialog into the shared `appModal` directive, and the modal
   styles into `styles/_modal.scss`, so both dialogs share them.

## Decision log

| Date       | Decision                                                                     | Why                                                                                          |
| ---------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 2026-11-25 | Home page join toasts stay demo data; the room shows real joins              | Owner's call: real names on the public home page would show strangers' names                 |
| 2026-11-25 | People who arrive together share one toast                                   | The toast shows one message at a time; separate ones would replace each other                |
| 2026-11-25 | Theme toggle talks to `ThemeService` without a view model                    | App-wide setting, no other state; a VM would only pass the call along                        |
| 2026-11-25 | The flipped cards in the players row are each person's score; no second list | Avoids showing every card twice on a small screen                                            |
| 2026-11-25 | Stage order lives in the markup, not CSS `order`                             | Keyboard and screen-reader order match what you see                                          |
| 2026-11-25 | A facilitator is a spectator seat, labelled "Moderator · facilitator"        | No new role or rules change; auto-reveal and the vote rules already exclude spectators       |
| 2026-11-25 | "I'm facilitating and won't vote" is ticked by default                       | Owner's call: most rooms are created by whoever runs the session                             |
| 2026-11-25 | The add-story dialog keeps its own draft form                                | UI-only state that dies with the dialog; the page's commands decide what adding means        |
| 2026-11-25 | Avatar faces are path data in TypeScript, not SVG files or markup            | No `innerHTML` and no `bypassSecurityTrust*` (strict CSP), no extra requests, themable tones |
| 2026-11-25 | The picker reports picks; the form's view model owns the value               | Same pattern as the colour swatches; no ControlValueAccessor needed for one field            |
| 2026-11-25 | Announce only seats newer than one minute                                    | Firestore may fill a listener from cache first, then the server; old seats aren't news       |
