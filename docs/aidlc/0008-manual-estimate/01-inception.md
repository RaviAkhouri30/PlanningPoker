# 01 · Inception — Manual estimate

Requested by the owner on 2026-11-25.

## Problem / goal

After the flip the moderator could only accept the suggested card or one of the cards voted. When
the discussion settles on something else (a card nobody played, or a value outside the deck),
there was no way to record it.

## User stories

1. As the moderator, after the cards flip I type the estimate the team agreed on and set it, and
   the room moves to the next story as with "Accept".

## Acceptance criteria

- Under the result's buttons: "Or settle on another value", a short field and "Set estimate";
  Enter works too.
- Any text up to 8 characters (the rules' limit for an estimate), trimmed; blank or longer shows
  "Type the agreed estimate, up to 8 characters." and sends nothing.
- Only the moderator sees it. The estimate shows in the stories table and the CSV like any other.
- Phones, light and dark themes, axe clean.

## Units of work

Custom estimate component · the accept command's check · tests and docs.

## Risks & open questions

- A value outside the deck isn't a card, so it doesn't feed any later statistics; today none
  read estimates, so nothing breaks.
- No rules change: `estimate` was already any text of 1 to 8 characters.
