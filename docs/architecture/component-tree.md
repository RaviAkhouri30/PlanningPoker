# Component tree

```mermaid
flowchart TB
  app[App: router outlet + site-footer + toasts]
  app --> landing["/ LandingPage"]
  app --> join["/r/:roomId/join JoinPage"]
  app --> room["/r/:roomId RoomPage (roomMemberGuard)"]
  app --> terms["/terms TermsPage"]

  landing --> lh[landing-header] & hf[hero-form] & hs[hero-stage] & hiw[how-it-works]
  landing --> fg[feature-grid] & ga[guest-account] & faq[faq-list] & cta[closing-cta] & lf[landing-footer]

  join --> rp[room-preview] & gjf[guest-join-form]

  room --> rh[room-header] & sh[story-header] & pt[poker-table] & cd[card-deck]
  room --> mc[moderator-controls] & pp[players-panel] & sp[stories-panel] & id[invite-dialog]
  room --> tour[room-tour: spotlight + step card]
  rh & pt -. "Add story: focus" .-> sp
  pt --> ts[table-seat] & res[results-panel]
  res --> cb[confetti-burst]
```

Shared building blocks: `logo`, `icon`, `avatar`, `toast`, `site-footer` (copyright and terms link), and the style directives
`appDelay`, `appWidthPercent` and `appBackground` (templates never bind styles directly).
