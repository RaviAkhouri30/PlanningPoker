import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  TEST_NOW,
  participantFields,
  roomFields,
  seed,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { RoomBackupReader } from './room-backup-reader.service';

describe('RoomBackupReader', () => {
  function story(order: number): Record<string, unknown> {
    return {
      key: `PAY-${String(order)}`,
      title: `Story ${String(order)}`,
      description: '',
      order,
      status: 'done',
      estimate: '5',
      rounds: 1,
      createdAt: TEST_NOW,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
  });

  it('should read the room with the votes of each story’s last revealed round', async () => {
    await seed({
      'rooms/r1': roomFields(),
      'rooms/r1/participants/u1': participantFields({ displayName: 'Maya' }),
      'rooms/r1/stories/s1': story(1),
      'rooms/r1/stories/s2': story(2),
      'rooms/r1/rounds/1': { storyId: 's1', revealed: true },
      'rooms/r1/rounds/3': { storyId: 's1', revealed: true },
      'rooms/r1/rounds/4': { storyId: '', revealed: true },
      'rooms/r1/rounds/1/votes/u1': { value: '3' },
      'rooms/r1/rounds/3/votes/u1': { value: '5' },
      'rooms/r1/rounds/3/votes/u2': { value: 8 },
    });

    const backup = await firstValueFrom(TestBed.inject(RoomBackupReader).read('r1'));

    expect(backup?.room.name).toBe('Sprint 42');
    expect(backup?.people.map((person) => person.displayName)).toEqual(['Maya']);
    expect(backup?.stories.map((item) => item.id)).toEqual(['s1', 's2']);
    expect([...(backup?.votes ?? [])]).toEqual([['s1', new Map([['u1', '5']])]]);
  });

  it('should read no votes when no round has been revealed', async () => {
    await seed({ 'rooms/r1': roomFields(), 'rooms/r1/stories/s1': story(1) });

    const backup = await firstValueFrom(TestBed.inject(RoomBackupReader).read('r1'));

    expect(backup?.votes.size).toBe(0);
  });

  it('should read nothing when the room is gone', async () => {
    await expect(firstValueFrom(TestBed.inject(RoomBackupReader).read('gone'))).resolves.toBeNull();
  });
});
