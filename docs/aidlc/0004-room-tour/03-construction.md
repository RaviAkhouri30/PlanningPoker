# 03 · Construction — Room tour

## Increments

1. `IPreferenceStore` port, `BrowserPreferenceStore` (try/catch around `localStorage`),
   `FakePreferenceStore`, `preferenceStoreFactory`, wiring in `provideBackend` and the test
   providers.
2. `TourTarget`, `TOUR_STEPS`, `tourStep` in the room state, `RoomTour` built in the view model.
3. `RoomTourComponent` and `RectDirective`; `data-tour` targets; "?" button in the header.
4. Footer split layout.
5. Specs, e2e (tour walk-through, skipping the tour in existing journeys), docs.

## Decision log

- **Built in, no library:** a spotlight is one fixed box with a large shadow; a tour library would
  add a dependency and its own styles.
- **Instant scrolling:** the spotlight measures where the part lands, and reduced-motion users get
  no animation.
- **Card position:** at the bottom, or at the top when the part's middle is below 55 % of the
  screen.
- **Marked as seen when it opens**, not when it's finished: a reload mid-tour doesn't restart it.
- **`card-deck` and `poker-table` hosts are blocks** so the spotlight can measure them.
- **Footer width in a room:** `:host-context(body:has(app-room-page))` widens it to the room's
  width, with no extra state.
- **E2E:** the Fake backend keeps rooms in memory, so "once per browser" is checked by opening a
  second room, not by reloading.
