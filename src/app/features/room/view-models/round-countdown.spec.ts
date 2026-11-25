import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { TEST_NOW } from '@shared/testing/test-backend';
import { type IRoomState } from '../models/i-room-state';
import { ROOM_MESSAGES } from '../models/room-messages.constants';
import { TimerPhase } from '../models/timer-phase.enum';
import { aRoom, aState } from '../testing/room-fixtures';
import { RoundCountdown } from './round-countdown';

describe('RoundCountdown', () => {
  const view = signal<IRoomState>(aState());
  const now = signal(TEST_NOW);
  let countdown: RoundCountdown;
  let shown: ReturnType<typeof vi.spyOn>;

  /** Moves the clock to `seconds` after the round started and checks for a toast. */
  function at(seconds: number): void {
    now.set(TEST_NOW + seconds * 1000);
    countdown.check();
  }

  beforeEach(() => {
    view.set(aState());
    now.set(TEST_NOW);
    shown = vi.spyOn(TestBed.inject(ToastService), 'show');
    countdown = TestBed.runInInjectionContext(() => new RoundCountdown({ view, now }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should count down from the room’s timer when a round is running', () => {
    at(15);

    expect(countdown.label()).toBe('00:45');
    expect(countdown.phase()).toBe(TimerPhase.Running);
    expect(countdown.locked()).toBe(false);
  });

  it('should warn once when the warning time is crossed live', () => {
    at(39);
    at(40);
    at(41);

    expect(countdown.phase()).toBe(TimerPhase.Warning);
    expect(shown).toHaveBeenCalledTimes(1);
    expect(shown).toHaveBeenCalledWith('20' + ROOM_MESSAGES.timeWarningSuffix, ToastTone.Warning);
  });

  it('should say time is up and lock voting when zero is reached with the lock on', () => {
    at(59);
    at(60);

    expect(countdown.phase()).toBe(TimerPhase.Up);
    expect(countdown.locked()).toBe(true);
    expect(shown).toHaveBeenCalledWith(ROOM_MESSAGES.timeUpLocked, ToastTone.Warning);
  });

  it('should say votes still count when zero is reached with the lock off', () => {
    view.set(aState({ room: aRoom({ lockOnTimeUp: false }) }));

    at(59);
    at(61);

    expect(countdown.locked()).toBe(false);
    expect(shown).toHaveBeenCalledWith(ROOM_MESSAGES.timeUpOpen, ToastTone.Warning);
  });

  it('should stay quiet when the room is opened after time already ran out', () => {
    at(90);
    at(91);

    expect(countdown.locked()).toBe(true);
    expect(shown).not.toHaveBeenCalled();
  });

  it('should start the count over when the timer is reset', () => {
    at(59);
    view.set(aState({ room: aRoom({ roundStartedAt: TEST_NOW + 59_000 }) }));
    at(60);

    expect(countdown.label()).toBe('00:59');
    expect(shown).not.toHaveBeenCalled();
  });

  it('should warn again when the countdown is lengthened past the warning', () => {
    at(39);
    at(41);
    view.set(aState({ room: aRoom({ timerSeconds: 90 }) }));
    at(42);
    at(70);

    expect(countdown.label()).toBe('00:20');
    expect(shown).toHaveBeenCalledTimes(2);
  });

  it('should be idle and never lock when the cards are flipped or no story is active', () => {
    view.set(aState({ room: aRoom({ revealed: true }) }));
    at(59);
    at(70);
    expect(countdown.phase()).toBe(TimerPhase.Idle);
    view.set(aState({ room: aRoom({ activeStoryId: null }) }));

    expect(countdown.label()).toBe('01:00');
    expect(countdown.locked()).toBe(false);
    expect(shown).not.toHaveBeenCalled();
  });

  it('should show the default length when there is no room yet', () => {
    view.set(aState({ room: null }));
    at(10);

    expect(countdown.label()).toBe('01:00');
    expect(countdown.locked()).toBe(false);
  });
});
