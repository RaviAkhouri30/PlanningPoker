import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  TEST_NOW,
  participantFields,
  seed,
  stored,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { VotesService } from './votes.service';

describe('VotesService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
    await seed({ 'rooms/r1/participants/u1': participantFields() });
  });

  it('should cast a vote and mark the voter in one commit', async () => {
    const votes = TestBed.inject(VotesService);

    await firstValueFrom(votes.cast('r1', 3, 'u1', '5'), { defaultValue: undefined });

    await expect(stored('rooms/r1/rounds/3/votes/u1')).resolves.toEqual({
      value: '5',
      castAt: TEST_NOW,
    });
    await expect(stored('rooms/r1/participants/u1')).resolves.toMatchObject({ votedRound: 3 });
    await expect(firstValueFrom(votes.watchMine('r1', 3, 'u1'))).resolves.toBe('5');
  });

  it('should take a vote back', async () => {
    const votes = TestBed.inject(VotesService);
    await firstValueFrom(votes.cast('r1', 3, 'u1', '5'), { defaultValue: undefined });

    await firstValueFrom(votes.retract('r1', 3, 'u1'), { defaultValue: undefined });

    await expect(firstValueFrom(votes.watchMine('r1', 3, 'u1'))).resolves.toBeNull();
    await expect(stored('rooms/r1/participants/u1')).resolves.toMatchObject({ votedRound: null });
  });

  it('should read every card of a round, skipping malformed votes', async () => {
    await seed({
      'rooms/r1/rounds/3/votes/u1': { value: '5' },
      'rooms/r1/rounds/3/votes/u2': { value: '?' },
      'rooms/r1/rounds/3/votes/u3': { value: 8 },
    });

    const cards = await firstValueFrom(TestBed.inject(VotesService).watchRound('r1', 3));

    expect([...cards]).toEqual([
      ['u1', '5'],
      ['u2', '?'],
    ]);
  });
});
