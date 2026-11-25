import { type Signal, computed, inject } from '@angular/core';
import { MS_PER_SECOND, TIMER_LIMITS } from '@shared/constants/timer.constants';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { formatClock } from '@shared/utils/display.util';
import { type IRoomState } from '../models/i-room-state';
import { ROOM_MESSAGES } from '../models/room-messages.constants';
import { RoomView } from '../models/room-view.builder';
import { TimerPhase } from '../models/timer-phase.enum';

/** What the countdown reads: the room's state and the ticking clock. */
export interface ICountdownHost {
  readonly view: () => IRoomState;
  readonly now: Signal<number>;
}

/** The last second seen, for the round it was seen in. */
interface ISeen {
  readonly key: string;
  readonly left: number;
}

/**
 * The round countdown: from the room's `timerSeconds` down to zero, a warning toast when
 * `TIMER_LIMITS.warningSeconds` are left and a "time's up" toast at zero, for everyone in the
 * room. With the room's lock on, voting closes at zero until the moderator resets the timer
 * (the rules close it too). Built in the view model's injection context.
 */
export class RoundCountdown {
  /** Whole seconds left. */
  public readonly secondsLeft = computed(
    () => this.host.view().room?.secondsLeft(this.host.now()) ?? TIMER_LIMITS.defaultSeconds,
  );
  /** e.g. "00:42". */
  public readonly label = computed(() => formatClock(this.secondsLeft() * MS_PER_SECOND));
  /** Whether a round is being voted on, so the countdown matters. */
  public readonly running = computed(() => {
    const state = this.host.view();
    return state.room?.revealed === false && RoomView.activeStory(state) !== null;
  });
  /** Where the countdown stands: idle, running, in its last seconds, or up. */
  public readonly phase = computed(() => {
    const left = this.secondsLeft();
    if (!this.running()) {
      return TimerPhase.Idle;
    }
    if (left === 0) {
      return TimerPhase.Up;
    }
    return left <= TIMER_LIMITS.warningSeconds ? TimerPhase.Warning : TimerPhase.Running;
  });
  /** Whether voting is closed because time ran out. */
  public readonly locked = computed(
    () => this.running() && (this.host.view().room?.isVotingLocked(this.host.now()) ?? false),
  );

  private readonly toast = inject(ToastService);
  private seen: ISeen | null = null;

  /** @param host The view model. */
  public constructor(private readonly host: ICountdownHost) {}

  /** @returns The toast for going from `before` to `left` seconds, or `null` for none. */
  private static notice(before: number, left: number, lockOnTimeUp: boolean): string | null {
    if (before > 0 && left === 0) {
      return lockOnTimeUp ? ROOM_MESSAGES.timeUpLocked : ROOM_MESSAGES.timeUpOpen;
    }
    const warning = TIMER_LIMITS.warningSeconds;
    return before > warning && left <= warning && left > 0
      ? String(warning) + ROOM_MESSAGES.timeWarningSuffix
      : null;
  }

  /**
   * Called on every tick: toasts when the countdown crosses the warning time or zero. Only a
   * crossing seen live counts, so opening a room whose time ran out long ago stays quiet.
   */
  public check(): void {
    const room = this.host.view().room;
    if (room === null || !this.running()) {
      this.seen = null;
      return;
    }
    // A reset or a new round starts the count over. A new length does not: lengthened past the
    // warning, the countdown warns again when it gets there; shortened into it, it warns now.
    const key = `${String(room.round)}:${String(room.roundStartedAt)}`;
    const left = this.secondsLeft();
    const before = this.seen?.key === key ? this.seen.left : null;
    this.seen = { key, left };
    const notice = before === null ? null : RoundCountdown.notice(before, left, room.lockOnTimeUp);
    if (notice !== null) {
      this.toast.show(notice, ToastTone.Warning);
    }
  }
}
