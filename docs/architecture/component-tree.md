# Component tree

```mermaid
flowchart TB
  app[App: router outlet + site-footer + toasts]
  app --> landing["/ LandingPage"]
  app --> join["/r/:roomId/join JoinPage"]
  app --> room["/r/:roomId RoomPage (roomMemberGuard)"]
  app --> terms["/terms TermsPage"]
  app --> mine["/rooms MyRoomsPage (returningGuestGuard on /)"]
  mine --> bdn[browser-data-notice] & srl["saved-room-list: Open, CSV, Forget"]

  landing --> lh[landing-header] & hf[hero-form] & hs[hero-stage] & hiw[how-it-works]
  hs --> hfl[hero-floats: demo join toasts]
  landing --> fg[feature-grid] & ga[guest-account] & faq[faq-list] & cta[closing-cta] & lf[landing-footer]

  join --> rp[room-preview] & gjf[guest-join-form]

  room --> rh[room-header] & sh[story-header] & pt["poker-table: the light stage"]
  pt -. "projects, while voting" .-> cd[card-deck]
  room --> mc[moderator-controls] & pp[players-panel] & sp["stories-panel: Download CSV"] & id[invite-dialog]
  room --> asd["add-story-dialog (moderator)"]
  room --> tour[room-tour: spotlight + step card]
  rh & pt -. "Add story: opens" .-> asd
  pt --> ts[table-seat: card coloured by band] & res[results-panel: band-coloured chart]
  res --> cb[confetti-burst]
```

Shared building blocks: `logo`, `icon`, `avatar` (an animal face, or initials for older seats),
`avatar-picker` (on the create and join forms), `toast`, `site-footer` (copyright and terms link),
`theme-toggle` (in every page header: system, light, dark), `appModal` (opens a native `<dialog>`
from state, used by both room dialogs), and the style directives
`appDelay`, `appWidthPercent` and `appBackground` (templates never bind styles directly).
