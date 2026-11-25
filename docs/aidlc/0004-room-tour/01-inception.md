# 01 · Inception — Room tour

Approved by the owner on 2026-11-25, with two choices: the tour opens by itself for the moderator
only, and the footer uses a split layout.

## Problem / goal

A first-time moderator lands in a busy room with no explanation of what each part does. The
copyright footer sat on the left edge of a wide box, out of line with the page above it.

## User stories

- As a moderator entering a room for the first time in this browser, I get a short guided tour.
- As anyone in a room, I can replay the tour from the top bar.
- As a visitor, the footer lines up with the page I'm on.

## Acceptance criteria

- The tour opens once per browser, for the moderator only; players never get it unasked.
- The moderator sees 8 steps (invite, add story, table, cards, moderator controls, people,
  stories, the tour button); players see the 6 that aren't moderator-only.
- Each step lights its part, scrolls it into view and explains it; Back, Next/Done, Skip and Escape
  work; focus moves to "Next"; no axe violations with the tour open.
- Footer: the notice on the left and the links on the right, at the page's content width (the
  room's width in a room); centred on phones.

## Units of work

`IPreferenceStore` port with browser and fake adapters · `RoomTour` (state in the room view model) ·
`RoomTourComponent` (spotlight + card) · `RectDirective` · `data-tour` targets and the "?" button ·
footer layout · specs and e2e.

## Risks & open questions

- "Once per browser": clearing site data or a private window shows it again. That's fine for a tour.
