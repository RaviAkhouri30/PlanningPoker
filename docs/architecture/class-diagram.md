# Class diagram

```mermaid
classDiagram
  class ViewModel~T~ {
    <<abstract>>
    +data Signal~T~
    +init() Observable~void~
    #attachViewHandler() Observable
    #attachCommandHandler() Observable
    #setData(value)
    #updateData(update)
  }
  class BaseComponent~T~ {
    <<abstract>>
    #model IViewModel~T~
    +ngOnInit()
  }
  class IRealtimeStore {
    <<abstract>>
    +watchDocument(path) Observable
    +watchCollection(path, orderBy) Observable
    +commit(writes) Observable~void~
  }
  class IAuthService {
    <<abstract>>
    +user$ Observable
    +signInAsGuest(name) Observable
  }
  class IClipboardService {
    <<abstract>>
    +copy(text) Observable~void~
  }
  class IPreferenceStore {
    <<abstract>>
    +read(key) string
    +write(key, value) void
  }
  IRealtimeStore <|-- FirebaseRealtimeStore
  IRealtimeStore <|-- FakeRealtimeStore
  IAuthService <|-- FirebaseAuthService
  IAuthService <|-- FakeAuthService
  IClipboardService <|-- BrowserClipboardService
  IClipboardService <|-- FakeClipboardService
  IPreferenceStore <|-- BrowserPreferenceStore
  IPreferenceStore <|-- FakePreferenceStore
  class IFileSaver {
    <<abstract>>
    +save(file) Observable~void~
  }
  IFileSaver <|-- BrowserFileSaver
  IFileSaver <|-- FakeFileSaver

  ViewModel <|-- LandingViewModel
  ViewModel <|-- JoinViewModel
  ViewModel <|-- RoomViewModel
  RoomViewModel *-- RoomCommands
  RoomViewModel *-- RoomTour
  RoomTour ..> IPreferenceStore : seen once per browser
  RoomViewModel ..> RoomView : builds seats, stats
  RoomCommands ..> ModerationService
  RoomCommands ..> VotesService
  RoomCommands ..> StoriesService
  RoomCommands ..> RoomBackupService : Download CSV
  ViewModel <|-- MyRoomsViewModel
  MyRoomsViewModel ..> RoomBackupService : Back up
  RoomBackupService ..> RoomBackupReader : one read per room
  RoomBackupService ..> IFileSaver
  RoomBackupReader ..> IRealtimeStore
  RoomViewModel ..> RoomsService
  RoomViewModel ..> ParticipantsService
  ModerationService ..> IRealtimeStore
  VotesService ..> IRealtimeStore
  StoriesService ..> IRealtimeStore
  RoomsService ..> IRealtimeStore
  ParticipantsService ..> IRealtimeStore
```

- `RoomViewModel` combines the live streams into one `IRoomState`; `RoomView` turns that state into
  seats, players, results and the next story with pure functions.
- `RoomCommands` runs every user action through one `concatMap` queue, so writes keep their order,
  and re-checks the moderator role when the action runs.
