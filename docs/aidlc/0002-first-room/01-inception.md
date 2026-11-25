# 01 · Inception — First room

## Problem / goal

The vertical slice: a moderator creates a room as a guest, shares the link, a teammate joins from
another browser, both vote, the cards flip, and the room settles an estimate.

## User stories

- As a moderator, I type my name, create a room and get a link and a short code to share.
- As a teammate, I open the link, give my name, colour and role, and land in the room.
- As a player, I pick a card in private; I can take it back or change it until the flip.
- As a moderator, I add stories, flip the cards (or let auto-reveal do it), and accept the
  suggested estimate, another card, vote again or skip.
- As anyone in the room, I see who has voted, the results (average, median, distribution,
  agreement) and the next story.

## Acceptance criteria

- Nobody can read another person's card before the flip, even with dev tools (rules tests).
- Auto-reveal flips 700 ms after the last player votes.
- The same link opens the room for members and the join form for everyone else.
- Works on desktop, tablet and phone; no axe WCAG 2.2 AA violations on the tested pages.

## Units of work

Landing · join · room (header, story, table, seats, results, deck, moderator controls, players,
stories, invite dialog) · rules and rules tests · e2e (Fake and two-browser Firebase).

## Risks & open questions

- Auto-reveal depends on the moderator's tab (accepted limitation, ADR-0008).
- Discussion threads and the summary page are deferred to later features (owner's decision).
