import { Service, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import {
  IRealtimeStore,
  SERVER_TIME,
  type StoreFields,
  type StoreWrite,
} from '@core/interfaces/i-realtime-store';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { type DeckType } from '@shared/enums/deck-type.enum';
import { StoryStatus } from '@shared/enums/story-status.enum';
import { type Room } from '@shared/models/room.model';
import { type Story } from '@shared/models/story.model';

/** The room update that starts the next round, with any other room changes. */
function newRound(room: Room, change: StoreFields = {}): StoreWrite {
  return {
    kind: StoreWriteKind.Update,
    path: STORE_PATHS.room(room.id),
    fields: { ...change, round: room.round + 1, revealed: false, roundStartedAt: SERVER_TIME },
  };
}

/** @returns The writes that make a new story the active one, for `StoriesService.add`. */
export function activationWrites(room: Room, storyId: string): StoreWrite[] {
  return [newRound(room, { activeStoryId: storyId })];
}

/**
 * What only a room's moderator may write (the rules check `moderatorUid`). Every action that
 * starts a new round moves `round` on by one, so earlier votes stay with their round and nobody's
 * `votedRound` has to be cleared.
 */
@Service()
export class ModerationService {
  private readonly store = inject(IRealtimeStore);

  /** Flips the current round's cards: marks the round revealed, which unlocks its votes. */
  public reveal(room: Room, story: Story): Observable<void> {
    return this.store.commit([
      {
        kind: StoreWriteKind.Set,
        path: STORE_PATHS.round(room.id, room.round),
        fields: { storyId: story.id, revealed: true, revealedAt: SERVER_TIME },
      },
      { kind: StoreWriteKind.Update, path: STORE_PATHS.room(room.id), fields: { revealed: true } },
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.story(room.id, story.id),
        fields: { rounds: story.rounds + 1 },
      },
    ]);
  }

  /** Clears the table for another vote on the same story. */
  public voteAgain(room: Room): Observable<void> {
    return this.store.commit([newRound(room)]);
  }

  /**
   * Settles a story: stores its estimate (or marks it skipped) and moves on to `next`.
   * @param estimate The accepted card, or `null` to skip the story.
   * @param next The story to vote on next, or `null` when none is left.
   */
  public settle(
    room: Room,
    story: Story,
    estimate: string | null,
    next: Story | null,
  ): Observable<void> {
    const status = estimate === null ? StoryStatus.Skipped : StoryStatus.Done;
    return this.store.commit([
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.story(room.id, story.id),
        fields: { status, estimate },
      },
      newRound(room, { activeStoryId: next?.id ?? null }),
    ]);
  }

  /** Votes on `story` next, whatever its status. */
  public select(room: Room, story: Story): Observable<void> {
    return this.store.commit([
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.story(room.id, story.id),
        fields: { status: StoryStatus.Pending },
      },
      newRound(room, { activeStoryId: story.id }),
    ]);
  }

  /** Switches the deck; the round restarts, since its cards may not exist in the new deck. */
  public setDeck(room: Room, deck: DeckType): Observable<void> {
    return this.store.commit([newRound(room, { deck })]);
  }

  /** Turns auto-reveal on or off. */
  public setAutoReveal(room: Room, autoReveal: boolean): Observable<void> {
    return this.update(room, { autoReveal });
  }

  /** Chooses whether new people join as spectators. */
  public setSpectatorsByDefault(room: Room, spectatorsByDefault: boolean): Observable<void> {
    return this.update(room, { spectatorsByDefault });
  }

  /** Starts the countdown again, which also opens voting again after time ran out. */
  public resetTimer(room: Room): Observable<void> {
    return this.update(room, { roundStartedAt: SERVER_TIME });
  }

  /** Sets how long the countdown runs; a longer one also gives the current round more time. */
  public setTimerSeconds(room: Room, timerSeconds: number): Observable<void> {
    return this.update(room, { timerSeconds });
  }

  /** Chooses whether voting closes when the countdown reaches zero. */
  public setLockOnTimeUp(room: Room, lockOnTimeUp: boolean): Observable<void> {
    return this.update(room, { lockOnTimeUp });
  }

  private update(room: Room, fields: StoreFields): Observable<void> {
    return this.store.commit([
      { kind: StoreWriteKind.Update, path: STORE_PATHS.room(room.id), fields },
    ]);
  }
}
