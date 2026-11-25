# 03 · Construction — Room polish and legal

## Increments

1. Legal: `legal.constants.ts`, `SiteFooterComponent` in the app shell, `/terms` page and route,
   `LICENSE` (all rights reserved), `author` and `"license": "UNLICENSED"` in both packages.
2. Add story: `addStory` outputs on `RoomHeaderComponent` and `PokerTableComponent`,
   `StoriesPanelComponent.focusDraft()`, wired by `RoomPageComponent.focusStoryField()`.
3. Deck disclosure and compact moderator tiles; empty table with an icon and a call to action.
4. Story rows renamed from `.row` to `.item`; room header static on phones.
5. Specs, e2e (`legal.e2e.ts`, a new room-flow test), docs.

## Decision log

- **Bug:** the story rows used the class `.row`, which Bootstrap's grid also styles (negative side
  margins, full-width children). Renamed to `.item`, with a comment.
- **Terms page without a view model:** it has no state, so there is nothing to provide; it's the
  one page that is a plain component.
- **One contentinfo landmark:** the landing page's closing links are now a `<div>`, so the
  app-wide copyright footer is the page's only `<footer>`.
- **Static room header on phones:** wrapped onto three rows, a sticky bar covered a quarter of the
  screen.
- **Version bump without a commit:** `npm version minor --no-git-tag-version`, because CLAUDE.md
  §13 leaves commits to the owner.
