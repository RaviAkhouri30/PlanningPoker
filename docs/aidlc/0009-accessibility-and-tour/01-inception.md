# 01 · Inception — Accessibility pass and a better room tour

Requested by the owner on 2026-11-25: "do an accessibility test and improve the guide".

## Problem / goal

The e2e axe scans covered WCAG 2.0 A/AA, 2.1 AA and 2.2 AA but not 2.1 A or axe's best
practices, so some issues could slip through. The room tour still described the room before the
countdown, the lock at time up and the manual estimate.

## User stories

1. As someone using voice control, I can say "click Vote 5" because the card's name includes
   what I see on it.
2. As a screen-reader user, every page has a main heading and all content sits in landmarks.
3. As a keyboard user, when the tour closes my focus goes somewhere sensible, not to the page.
4. As anyone in the room, the tour explains the countdown and, for the moderator, how to settle
   an estimate, including typing the agreed value.
5. As a keyboard user, the arrow keys move through the tour, and each new step is announced.

## Acceptance criteria

- A full audit (axe with WCAG 2.2 A/AA plus best practices) on landing, terms, the room with the
  tour, empty, voting, dialogs, results with its error, stories and My rooms; light and dark;
  desktop and phone; reduced motion: no violations.
- The e2e scans use the wider tag set from now on, and the join page is scanned too.
- No horizontal scroll at 320 px or with text at 200 %; focus visible on every control.
- The tour shows once more to moderators who saw the old one (seen value `v2`).

## Risks & open questions

- axe can't judge contrast over layered backgrounds (tour card, dialogs, the SVG ring); those
  pairs were checked from the tokens by hand (all ≥ 5.4:1).
- Automated checks don't replace a screen-reader session (VoiceOver, NVDA) by a person.
