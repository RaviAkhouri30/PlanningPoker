# 02 · Design — Room polish and legal

## Component tree

```mermaid
flowchart TD
  App --> RouterOutlet
  App --> SiteFooter["SiteFooterComponent (new): © line + Terms link"]
  App --> Toast
  RouterOutlet --> Landing
  RouterOutlet --> Join
  RouterOutlet --> Room
  RouterOutlet --> Terms["TermsPageComponent (new, /terms)"]
  Room --> RoomHeader["RoomHeader: + Add story (moderator)"]
  Room --> PokerTable["PokerTable: + Add a story on the empty table"]
  Room --> ModeratorControls["ModeratorControls: deck in a details disclosure"]
  Room --> StoriesPanel["StoriesPanel: focusDraft()"]
```

## Sequence diagram

```mermaid
sequenceDiagram
  actor M as Moderator
  participant H as RoomHeader / PokerTable
  participant P as RoomPageComponent
  participant S as StoriesPanelComponent
  M->>H: click "Add story"
  H-->>P: addStory output
  P->>S: focusDraft() via viewChild
  S->>S: input.focus() (scrolls into view, scroll-margin clears the header)
  M->>S: type title, Enter
  S-->>P: add output → RoomViewModel.commands.addStory
```

The jump is view-only (focus), so it stays in the component layer; the view model is unchanged.

## Data model and rules

No change. The terms page is static; the copyright text lives in `shared/constants/legal.constants.ts`.

## ADRs raised

None. Using the native `<details>` element for the deck keeps the open state out of the view
model and gives keyboard and screen-reader support for free.
