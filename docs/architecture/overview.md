# Architecture overview

PlanningPoker is a single-page Angular app. Everyone in a room listens to the same few Firestore
documents, so a vote, a flip or a new story appears in every browser within a moment. There is no
app server in the loop: Firestore's security rules are the server-side authority.

## System context

```mermaid
flowchart LR
  mod([Moderator's browser]) -- listens + batched writes --> fs[(Cloud Firestore)]
  guest([Team member's browser]) -- listens + batched writes --> fs
  mod -- anonymous sign-in --> auth[Firebase Auth]
  guest -- anonymous sign-in --> auth
  swa[Azure Static Web Apps] -- serves the app + runtime-config.js --> mod
  swa --> guest
  api[Azure Functions /api] -. health now, integrations later .- swa
  fs -. enforced by .- rules{{firestore.rules}}
```

## Layers

```mermaid
flowchart TB
  subgraph View
    C[Page + presentational components]
  end
  subgraph Logic
    VM[View models: signals + RxJS]
    S[Feature services: paths, DTO mapping, batches]
  end
  subgraph Ports
    P[IRealtimeStore · IAuthService · IClipboardService · IPreferenceStore · IFileSaver]
  end
  subgraph Adapters
    F[Firebase adapters, lazy chunk]
    K[Fake adapters, in memory]
    B[Browser clipboard, storage, downloads]
  end
  C --> VM --> S --> P
  P --> F
  P --> K
  P --> B
```

- Dependencies point one way: `features → shared → core/interfaces`. Only `core/backends`
  imports `firebase/*`, and only the factories reference `core/backends`.
- `APP_ENVIRONMENT.backend` picks Fake (`npm start`, unit tests, the Fake e2e suite) or Firebase
  (emulator and production builds).
- The Firebase SDK is loaded on demand through gateway loader tokens, so the landing page stays
  small.

## Features

| Feature    | Route             | What it does                                                                       |
| ---------- | ----------------- | ---------------------------------------------------------------------------------- |
| `landing`  | `/`               | Marketing page; create a room as a guest, or join by code                          |
| `my-rooms` | `/rooms`          | The rooms this browser has been in: open, back up as CSV, forget (after a warning) |
| `join`     | `/r/:roomId/join` | Name, colour and role for someone opening a room link                              |
| `room`     | `/r/:roomId`      | The table: stories, votes, the flip, results, moderator controls                   |
| `legal`    | `/terms`          | Terms of use: copyright, no account needed, data, warranty                         |

`roomMemberGuard` sends anyone who is not yet in the room from `/r/:roomId` to the join form, so
the one link works for everybody. `returningGuestGuard` sends a guest who arrives at `/` with rooms
saved in this browser to `/rooms`; links inside the app still reach the home page.

The guest's name, avatar and room list live in this browser (`IPreferenceStore`, keys
`planning-poker.profile` and `planning-poker.rooms`), through `LocalProfileService` and
`MyRoomsService`. Clearing browser data empties them; the rooms stay in Firestore.

**CSV backup.** `RoomBackupService` (shared) reads each room once (`RoomBackupReader`: the room,
its people, stories and, per story, the votes of its last flipped round, as the rules allow), builds
one UTF-8 CSV with `backupCsv` and hands it to `IFileSaver`. One row per story; columns: room, room
code, key, story, notes, status, estimate, rounds, then one per voter. Cells that start like a
formula (`= + - @`) get a leading `'` so a spreadsheet shows them as text. The room's stories table
saves that room; My rooms saves one room or all of them in one file. Nothing is uploaded.

## Known limitations

- **Auto-reveal runs in the moderator's tab** (rules can't count votes). If the moderator's tab is
  closed, the round waits until the moderator returns or flips by hand.
- Presence is a heartbeat (`lastSeenAt` every 60 s while the tab is on screen, online within 150 s),
  not a live connection. A hidden tab stops beating, so a room left open in the background is free.
- Discussion threads, the session summary and accounts are later features.
