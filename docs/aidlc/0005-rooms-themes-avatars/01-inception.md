# 01 · Inception — Rooms, themes and avatars

Requested by the owner on 2026-11-25 (13 items). Approved choices: one release (1.4.0); score
colours measured against the deck; CSV with stories and every revealed vote; friendly animal
avatars.

## Problem / goal

The room looks heavy (a black table, cards at the bottom), there is no dark mode, a guest can't
get back to their rooms, nothing warns that guest data lives in the browser, there is no backup,
and the moderator always votes.

## User stories

1. As a guest, I can have several rooms and land on **My rooms** to open one, instead of creating
   a new one each time (items 1, 5).
2. As a guest without an account, my name, avatar, theme and rooms are kept in this browser
   (item 2). Firebase Auth already keeps the guest session in the browser.
3. I see a short warning that clearing browser data loses my guest identity, my room list and
   moderator rights (item 3).
4. I can download a CSV backup of a room, or of all my rooms (item 4).
5. As the moderator, "Add story" opens a dialog; the Stories panel no longer has its own field
   (items 6, 7).
6. The room is light: the cards are the main area; after the flip I see the average, every
   person's card and a small chart coloured green (low), yellow (middle), red (high) and grey (no
   vote), measured against the deck (items 8, 10). Everyone in the room sees it (item 11).
7. I can use a light or dark theme, or follow the system (item 9).
8. As the organiser, I can facilitate without voting, so auto-reveal waits only for the players
   (item 12).
9. I pick an animal avatar before entering a room, or get a random one (item 13).
10. In a room, I'm told when a real person takes a seat ("Priya joined the room"). The home
    page keeps its demo toasts (owner's call, 2026-11-25).

## Acceptance criteria

- Theme: light, dark and system; remembered per browser; no flash of the wrong theme on load; all
  pages pass axe in both themes.
- Room: no dark table; the deck is the centre of the room while voting; results show average,
  median, agreement, each person's card and a colour-coded distribution; grey for people who
  didn't vote.
- Facilitator: the creator chooses "I'll vote" or "Facilitate only" when creating a room
  (facilitating is ticked by default), and can switch in the room; a facilitator is a spectator, so auto-reveal ignores them.
- Avatars: 16 animals, picked on the create and join forms, random by default; stored on the seat;
  rules accept only known avatar ids; rules tests cover it.
- My rooms: every room you create or join is listed (name, code, your role, last visit); the
  landing page sends returning guests there; you can open, forget or back up a room.
- CSV: per room and for all rooms; UTF-8 with a header row; formula-injection safe.

## Units of work

Theme tokens and switch · room stage redesign and results chart · avatars, facilitator, rules ·
Add story dialog · local profile, My rooms page, warning, CSV · specs, rules tests, e2e, docs.

## Risks & open questions

- Rooms are shared in Firestore; the browser only keeps the list and profile. Clearing browser
  data loses the guest identity: rooms still exist but this browser can't moderate them any more.
  Accounts (later) fix this.
- A rules change must be deployed with `npm run deploy:rules` before the app that uses it.
