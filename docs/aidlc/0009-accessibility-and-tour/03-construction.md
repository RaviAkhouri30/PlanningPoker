# 03 · Construction — Accessibility pass and a better room tour

## Audit findings and fixes

| Finding (axe rule or check)                                | Where                         | Fix                                                        |
| ---------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| `label-content-name-mismatch` (serious)                    | Vote cards, every room state  | Name from content: hidden "Vote " + the visible value       |
| `page-has-heading-one`                                     | Room with no story            | Visually hidden `h1` with the room name                     |
| `region`                                                   | Landing footer logo           | The footer links are a labelled region                      |
| `page-has-heading-one` (new join-page scan)                | Join and room while loading   | "Opening the room…" is a heading, styled as before           |
| `aria-allowed-role` (new join-page scan)                   | Join form                     | The tabpanel role moved from the form to a wrapper           |
| Focus fell to the page when the tour closed                | Room tour                     | Focus back to the opener, or to the tour button             |
| Contrast "needs review" (layered backgrounds)              | Tour card, dialogs, SVG ring  | Checked by hand from the tokens: all pass AA                |
| Reflow at 320 px, text at 200 %, focus visible, reduced motion | All pages                 | Already fine                                               |

## Increments

1. Fixes above, with specs (card names through a shared `accessibleName` test helper).
2. Tour: new and updated steps, arrow keys, live step text, dots, focus return; seen value `v2`.
3. Countdown label idle at full length (found in the tour screenshots).
4. e2e: wider axe tags through `axeFor`, the join page scanned, the tour's arrow keys and focus
   return covered.

## Decision log

| Date       | Decision                                                  | Why                                                                    |
| ---------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| 2026-11-25 | Best-practice rules join the e2e scans                    | They caught the card names and the missing heading; keep them caught    |
| 2026-11-25 | The tour shows again once (`v2`)                          | It now explains features the earlier tour didn't                       |
| 2026-11-25 | Players still don't get the tour automatically            | The owner's earlier choice (AIDLC 0004); anyone can replay it          |
