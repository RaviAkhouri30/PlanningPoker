import { Animal } from '@shared/enums/animal.enum';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import {
  TEST_NOW,
  participantFields,
  seed,
  stored,
  testBackendProviders,
  testClock,
} from '@shared/testing/test-backend';
import { ParticipantsService } from './participants.service';

describe('ParticipantsService', () => {
  const profile = {
    displayName: 'Maya',
    colour: 1,
    role: ParticipantRole.Spectator,
    avatar: Animal.Owl,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should list everyone in join order', async () => {
    await seed({
      'rooms/r1/participants/b': participantFields({ displayName: 'B', joinedAt: 2 }),
      'rooms/r1/participants/a': participantFields({ displayName: 'A', joinedAt: 1 }),
    });

    const everyone = await firstValueFrom(TestBed.inject(ParticipantsService).watchAll('r1'));

    expect(everyone.map((person) => person.displayName)).toEqual(['A', 'B']);
  });

  it('should take a new seat when joining for the first time', async () => {
    const participants = TestBed.inject(ParticipantsService);

    await firstValueFrom(participants.join('r1', 'u1', profile), { defaultValue: undefined });

    await expect(firstValueFrom(participants.watchOne('r1', 'u1'))).resolves.toMatchObject({
      displayName: 'Maya',
      role: ParticipantRole.Spectator,
      avatar: Animal.Owl,
    });
  });

  it('should keep the join time when rejoining', async () => {
    await seed({ 'rooms/r1/participants/u1': participantFields({ joinedAt: 5 }) });
    vi.spyOn(testClock, 'now').mockReturnValue(TEST_NOW + 1000);

    await firstValueFrom(TestBed.inject(ParticipantsService).join('r1', 'u1', profile), {
      defaultValue: undefined,
    });

    await expect(stored('rooms/r1/participants/u1')).resolves.toMatchObject({
      displayName: 'Maya',
      joinedAt: 5,
      lastSeenAt: TEST_NOW + 1000,
    });
  });

  it('should emit null for someone not in the room', async () => {
    await expect(
      firstValueFrom(TestBed.inject(ParticipantsService).watchOne('r1', 'x')),
    ).resolves.toBeNull();
  });

  it('should stamp the time when a heartbeat is sent', async () => {
    await seed({ 'rooms/r1/participants/u1': participantFields({ lastSeenAt: 1 }) });

    await firstValueFrom(TestBed.inject(ParticipantsService).heartbeat('r1', 'u1'), {
      defaultValue: undefined,
    });

    await expect(stored('rooms/r1/participants/u1')).resolves.toMatchObject({
      lastSeenAt: TEST_NOW,
    });
  });

  it('should change the role on the seat when someone switches to facilitating', async () => {
    await seed({ 'rooms/r1/participants/u1': participantFields({ role: 'player' }) });

    await firstValueFrom(
      TestBed.inject(ParticipantsService).setRole('r1', 'u1', ParticipantRole.Spectator),
      { defaultValue: undefined },
    );

    await expect(stored('rooms/r1/participants/u1')).resolves.toMatchObject({
      role: 'spectator',
    });
  });
});
