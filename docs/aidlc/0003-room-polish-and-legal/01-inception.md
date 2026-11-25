# 01 · Inception — Room polish and legal

Approved by the owner on 2026-11-25 (inception and design together, with the license choice).

## Problem / goal

- The code and the app carry no copyright or license, and nothing tells people whether they need
  an account.
- An empty room says "add a story in the Stories panel" but gives no way to get there; the
  moderator has to find the field at the bottom of the side column.
- The deck picker takes a lot of the side column, and the moderator tiles are tall.
- Story rows in the Stories panel are clipped on the left and stack their parts vertically.

## User stories

- As the owner, I want the code marked "© 2026 Ravi Akhouri. All rights reserved." with a LICENSE
  file, so nobody mistakes it for open source.
- As a visitor, I see the copyright on every page and can read terms that say I don't need an
  account today, that optional accounts may come later, and where room data lives.
- As a moderator in an empty room, I press "Add a story" on the table and land in the story field.
- As a moderator, I always have "Add story" in the top bar.
- As a moderator, the deck choice stays collapsed until I need it, showing the current deck.

## Acceptance criteria

- `LICENSE` (all rights reserved) in the repository root; `package.json` and `api/package.json`
  say `"license": "UNLICENSED"` and name the author.
- Every page ends with the copyright line and a "Terms of use" link to `/terms`, the page's one
  contentinfo landmark. `/terms` covers copyright, accounts, data and warranty, with no axe
  violations.
- "Add story" (header) and "Add a story" / "Add another story" (empty table) show only to the
  moderator and move focus to the story field.
- The deck section is a disclosure, closed by default, naming the current deck.
- Story rows show key, title and badge on one line, unclipped.
- Phone, tablet and desktop: no horizontal scroll; the room header doesn't stay stuck on phones.

## Units of work

Legal (constants, `SiteFooterComponent`, terms page and route, LICENSE, package metadata) · room
header and table buttons, focus helper · deck disclosure and compact controls · story row fix ·
specs and e2e.

## Risks & open questions

- The terms are a plain-language starting point, not legal advice; the owner may want them
  reviewed before a public launch. "Planning Poker" is a registered trademark of Mountain Goat
  Software: check before a public launch.
