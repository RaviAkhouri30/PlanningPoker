# 03 · Construction — First room

## Increments

- `291ddd4` feat(landing): landing page with guest room creation and join by code.
- `aa3a484` feat(join): join page behind a room's link.
- `0a72e90` feat(room): the live planning room.
- `a7b3fe1` feat(rules): secure rooms, seats, stories and secret votes.
- `0a5138a` test(rules): check the lone vote write before the seat is marked.
- `d074ea3` fix(landing): show a sample room code the app can issue.
- e2e suites, accessibility fix for the comparison table, and these docs.

## Decisions & deviations from design

- Votes are written with the voter's `votedRound` in one batch, so seats show "voted" without
  revealing values.
- The flip creates `rounds/{round}`; others' votes are only listened to after that.
- Confetti moved into its own component to stay under the 4 kB component style budget.
- The comparison table scrolls sideways on phones, so its wrapper is a focusable, labelled region.
- The two-browser e2e test caught a race: the moderator's tab sees its own flip before the server
  stores it, so its first read of the round's cards could be refused and take the room down.
  `VotesService.watchRound` now retries a refused read a few times (`ROUND_VOTES_RETRIES`).
