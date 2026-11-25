# 02 · Design — Room tour

## Component tree

`RoomPageComponent` renders `RoomTourComponent` while `model.tour.progress()` is not `null`. The
parts it points at carry a `data-tour` attribute (`TourTarget` enum): the header's Invite, Add story
and "?" buttons, the poker table, the card deck, the moderator controls, the people and stories
panels.

## Class diagram

```mermaid
classDiagram
  class RoomViewModel {
    +tour RoomTour
  }
  class RoomTour {
    +steps Signal
    +progress Signal
    +offer()
    +start()
    +next()
    +back()
    +close()
  }
  class IPreferenceStore {
    <<abstract>>
    +read(key) string
    +write(key, value) void
  }
  RoomViewModel *-- RoomTour
  RoomTour ..> IPreferenceStore
  IPreferenceStore <|-- BrowserPreferenceStore
  IPreferenceStore <|-- FakePreferenceStore
```

## Sequence diagram

```mermaid
sequenceDiagram
  participant VM as RoomViewModel
  participant T as RoomTour
  participant P as IPreferenceStore
  participant C as RoomTourComponent
  VM->>T: offer() when the room first loads
  T->>P: read(tour key)
  alt moderator and not seen
    T->>P: write(tour key, v1)
    T->>VM: patch(tourStep 0)
    VM-->>C: progress(step 1 of 8)
    C->>C: find [data-tour], scrollIntoView, measure, focus Next
  end
```

## Data model and rules

No Firestore change. One `localStorage` key: `planning-poker.room-tour = v1` (bump the value to show
a changed tour again).

## ADRs raised

None: a new port follows ADR-0002. The tour state lives in the room view model's state
(`tourStep`), so the page still has one subscription.
