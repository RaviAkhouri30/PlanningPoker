import { TestBed } from '@angular/core/testing';
import { defer, firstValueFrom, of, throwError } from 'rxjs';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { ROUND_VOTES_RETRY_MS } from '@shared/constants/room.constants';
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

  it('should retry reading a round the server has not stored as revealed yet', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const store = TestBed.inject(IRealtimeStore);
    vi.spyOn(store, 'watchCollection').mockReturnValue(
      defer(() => {
        attempts += 1;
        return attempts === 1
          ? throwError(() => new Error('permission-denied'))
          : of([{ id: 'u1', fields: { value: '5' } }]);
      }),
    );

    const cards = firstValueFrom(TestBed.inject(VotesService).watchRound('r1', 3));
    await vi.advanceTimersByTimeAsync(ROUND_VOTES_RETRY_MS);

    await expect(cards).resolves.toEqual(new Map([['u1', '5']]));
    expect(attempts).toBe(2);
    vi.useRealTimers();
  });
});
