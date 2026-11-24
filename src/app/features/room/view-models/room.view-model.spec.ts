import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { type Subscription, firstValueFrom, throwError } from 'rxjs';
import { FAKE_GUEST_UID } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { AUTO_REVEAL_DELAY_MS, HEARTBEAT_INTERVAL_MS } from '@shared/constants/room.constants';
import {
  TEST_NOW,
  participantFields,
  roomFields,
  seed,
  stored,
  testBackendProviders,
  testClock,
} from '@shared/testing/test-backend';
import { RoomStatus } from '../models/i-room-state';
import { storyFields } from '../testing/room-fixtures';
import { RoomViewModel } from './room.view-model';

/** The moderator is the signed-in fake guest. */
const ME = FAKE_GUEST_UID;

describe('RoomViewModel', () => {
  let subscription: Subscription | undefined;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://ante.test' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ roomId: 'r1' }) } },
        },
        RoomViewModel,
      ],
    });
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Alex Kim'));
    await seed({
      'rooms/r1': roomFields({ moderatorUid: ME, activeStoryId: 's1' }),
      [`rooms/r1/participants/${ME}`]: participantFields({ displayName: 'Alex Kim' }),
      'rooms/r1/participants/maya': participantFields({ displayName: 'Maya Chen', colour: 1 }),
      'rooms/r1/stories/s1': storyFields(),
    });
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function start(): RoomViewModel {
    const model = TestBed.inject(RoomViewModel);
    subscription = model.init().subscribe();
    return model;
  }

  it('should combine the room, its people and stories', () => {
    const model = start();

    expect(model.view().status).toBe(RoomStatus.Ready);
    expect(model.isModerator()).toBe(true);
    expect(model.activeStory()?.title).toBe('Save cards');
    expect(model.tableSeats().map((seat) => seat.shortName)).toEqual(['You', 'Maya']);
    expect(model.playerCount()).toBe(2);
    expect(model.canVote()).toBe(true);
    expect(model.link).toBe('ante.test/r/r1');
  });

  it('should tick the timer and count who is online', () => {
    const now = vi.spyOn(testClock, 'now').mockReturnValue(TEST_NOW + 65_000);
    const model = start();

    expect(model.timerLabel()).toBe('01:05');
    expect(model.onlineCount()).toBe(2);
    now.mockReturnValue(TEST_NOW + 66_000);
    vi.advanceTimersByTime(1000);
    expect(model.timerLabel()).toBe('01:06');
  });

  it('should show my vote and, once revealed, everyone’s cards and the stats', async () => {
    const model = start();

    model.commands.pick('5');
    expect(model.view().myCard).toBe('5');
    expect(model.votedCount()).toBe(1);

    await seed({ 'rooms/r1/rounds/1/votes/maya': { value: '8' } });
    model.commands.reveal();

    expect(model.view().room?.revealed).toBe(true);
    expect(model.stats()?.numericCount).toBe(2);
    expect(model.canVote()).toBe(false);
  });

  it('should flip automatically a moment after the last player votes', async () => {
    const model = start();
    model.commands.pick('5');
    await seed({
      'rooms/r1/participants/maya': participantFields({ displayName: 'Maya Chen', votedRound: 1 }),
    });

    vi.advanceTimersByTime(AUTO_REVEAL_DELAY_MS - 1);
    expect(model.view().room?.revealed).toBe(false);
    vi.advanceTimersByTime(1);

    expect(model.view().room?.revealed).toBe(true);
  });

  it('should tell the room it is still there', async () => {
    start();

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    await expect(stored(`rooms/r1/participants/${ME}`)).resolves.toMatchObject({
      lastSeenAt: TEST_NOW,
    });
  });

  it('should say when the room is gone or cannot be read', () => {
    const watch = vi.spyOn(TestBed.inject(IRealtimeStore), 'watchDocument');
    watch.mockReturnValueOnce(throwError(() => new Error('denied')));

    expect(start().view().status).toBe(RoomStatus.Failed);
  });

  it('should keep going and say so when a write fails', () => {
    const model = start();
    vi.spyOn(TestBed.inject(IRealtimeStore), 'commit').mockReturnValueOnce(
      throwError(() => new Error('offline')),
    );

    model.commands.pick('5');
    model.commands.pick('3');

    expect(model.view().myCard).toBe('3');
  });
});
