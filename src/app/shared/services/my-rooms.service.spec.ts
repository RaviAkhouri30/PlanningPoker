import { TestBed } from '@angular/core/testing';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { ROOMS_STORAGE_KEY } from '@shared/constants/local-data.constants';
import { RoomRole } from '@shared/enums/room-role.enum';
import { type ISavedRoom } from '@shared/interfaces/i-saved-room';
import { MyRoomsService } from './my-rooms.service';

describe('MyRoomsService', () => {
  const sprint: ISavedRoom = {
    id: 'r1',
    name: 'Sprint 42',
    code: 'X7K2-92',
    role: RoomRole.Moderator,
    lastVisit: 100,
  };
  let preferences: FakePreferenceStore;

  function create(saved: readonly ISavedRoom[] = []): MyRoomsService {
    preferences = new FakePreferenceStore();
    preferences.write(ROOMS_STORAGE_KEY, JSON.stringify(saved));
    TestBed.configureTestingModule({
      providers: [{ provide: IPreferenceStore, useValue: preferences }],
    });
    return TestBed.inject(MyRoomsService);
  }

  it('should list the saved rooms when the browser has some', () => {
    expect(create([sprint]).rooms()).toEqual([sprint]);
  });

  it('should put a new room first and save the list when one is remembered', () => {
    const rooms = create([sprint]);

    rooms.remember({ ...sprint, id: 'r2', name: 'Refunds', lastVisit: 200 });

    expect(rooms.rooms().map((room) => room.id)).toEqual(['r2', 'r1']);
    expect(preferences.read(ROOMS_STORAGE_KEY)).toContain('"id":"r2"');
  });

  it('should refresh a room instead of listing it twice when it is remembered again', () => {
    const rooms = create([sprint, { ...sprint, id: 'r2', lastVisit: 150 }]);

    rooms.remember({ ...sprint, name: 'Sprint 43', lastVisit: 300 });

    expect(rooms.rooms().map((room) => [room.id, room.name])).toEqual([
      ['r1', 'Sprint 43'],
      ['r2', 'Sprint 42'],
    ]);
  });

  it('should drop a room from the list when it is forgotten', () => {
    const rooms = create([sprint]);

    rooms.forget('r1');

    expect(rooms.rooms()).toEqual([]);
    expect(preferences.read(ROOMS_STORAGE_KEY)).toBe('[]');
  });
});
