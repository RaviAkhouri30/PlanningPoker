import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import {
  TEST_NOW,
  roomFields,
  seed,
  stored,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  const moderator = { displayName: 'Alex Kim', colour: 0, role: ParticipantRole.Player };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
  });

  it('should create the room, its code and the moderator seat in one commit', async () => {
    const roomId = await firstValueFrom(
      TestBed.inject(RoomsService).create({ name: 'Sprint 42', moderatorUid: 'mod', moderator }),
    );

    expect(roomId).toBe('sprint-42-aaaaaa');
    await expect(stored('rooms/sprint-42-aaaaaa')).resolves.toEqual(roomFields());
    await expect(stored('roomCodes/AAAA-AA')).resolves.toEqual({ roomId });
    await expect(stored('rooms/sprint-42-aaaaaa/participants/mod')).resolves.toMatchObject({
      displayName: 'Alex Kim',
      votedRound: null,
      joinedAt: TEST_NOW,
    });
  });

  it('should name a room "Planning poker" when no name is given', async () => {
    const roomId = await firstValueFrom(
      TestBed.inject(RoomsService).create({ name: '  ', moderatorUid: 'mod', moderator }),
    );

    expect(roomId).toBe('planning-poker-aaaaaa');
  });

  it('should retry with a new code when a commit fails', async () => {
    const store = TestBed.inject(IRealtimeStore);
    const commit = vi
      .spyOn(store, 'commit')
      .mockReturnValueOnce(throwError(() => new Error('taken')))
      .mockReturnValueOnce(of(undefined));

    await firstValueFrom(
      TestBed.inject(RoomsService).create({ name: 'A', moderatorUid: 'mod', moderator }),
    );

    expect(commit).toHaveBeenCalledTimes(2);
  });

  it('should watch a room as a model, and null when missing', async () => {
    await seed({ 'rooms/r1': roomFields({ round: 4 }) });
    const rooms = TestBed.inject(RoomsService);

    await expect(firstValueFrom(rooms.watch('r1'))).resolves.toMatchObject({ id: 'r1', round: 4 });
    await expect(firstValueFrom(rooms.watch('none'))).resolves.toBeNull();
  });

  it('should find a room id by code, and null for an unknown code', async () => {
    await seed({ 'roomCodes/X7K2-92': { roomId: 'r1' } });
    const rooms = TestBed.inject(RoomsService);

    await expect(firstValueFrom(rooms.findRoomId('X7K2-92'))).resolves.toBe('r1');
    await expect(firstValueFrom(rooms.findRoomId('ZZZZ-ZZ'))).resolves.toBeNull();
  });
});
