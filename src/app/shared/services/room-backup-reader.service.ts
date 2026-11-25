import { Service, inject } from '@angular/core';
import { type Observable, combineLatest, forkJoin, map, of, switchMap, take } from 'rxjs';
import { IRealtimeStore, type IStoredDocument } from '@core/interfaces/i-realtime-store';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { type BackupVotes, type IRoomBackup } from '@shared/interfaces/i-room-backup';
import { Participant } from '@shared/models/participant.model';
import { Room } from '@shared/models/room.model';
import { Story } from '@shared/models/story.model';
import { FieldReader } from '@shared/utils/fields.util';

/**
 * @param rounds The room's revealed rounds (`rounds/{round}` markers).
 * @returns For each story, the number of its last revealed round.
 */
function lastRoundByStory(rounds: readonly IStoredDocument[]): ReadonlyMap<string, number> {
  const last = new Map<string, number>();
  for (const marker of rounds) {
    const storyId = FieldReader.text(marker.fields, 'storyId');
    const round = Number(marker.id);
    if (storyId !== '' && Number.isInteger(round) && round > (last.get(storyId) ?? 0)) {
      last.set(storyId, round);
    }
  }
  return last;
}

function cardsOf(documents: readonly IStoredDocument[]): BackupVotes {
  return new Map(
    documents.flatMap((vote) => {
      const card = FieldReader.textOrNull(vote.fields, 'value');
      return card === null ? [] : [[vote.id, card] as const];
    }),
  );
}

/**
 * Reads a room once for a backup: the room, its people, its stories and, for each story, the
 * votes of its last revealed round. Only revealed votes: the rules hide the rest anyway.
 */
@Service()
export class RoomBackupReader {
  private readonly store = inject(IRealtimeStore);

  /** @returns The room's backup, or `null` when the room is gone; errors when refused. */
  public read(roomId: string): Observable<IRoomBackup | null> {
    // take(1) on each listener: a backup is a snapshot, so no listener stays open.
    return combineLatest([
      this.once(this.store.watchDocument(STORE_PATHS.room(roomId))),
      this.once(this.store.watchCollection(STORE_PATHS.participants(roomId), 'joinedAt')),
      this.once(this.store.watchCollection(STORE_PATHS.stories(roomId), 'order')),
      this.once(this.store.watchCollection(STORE_PATHS.rounds(roomId))),
    ]).pipe(
      // switchMap: one snapshot arrives, so there is only ever one set of vote reads to follow.
      switchMap(([room, people, stories, rounds]) => {
        if (room === null) {
          return of(null);
        }
        return this.votesByStory(roomId, lastRoundByStory(rounds)).pipe(
          map((votes) => ({
            room: new Room(roomId, room),
            people: people.map((item) => new Participant(item.id, item.fields)),
            stories: stories.map((item) => new Story(item.id, item.fields)),
            votes,
          })),
        );
      }),
    );
  }

  private votesByStory(
    roomId: string,
    rounds: ReadonlyMap<string, number>,
  ): Observable<ReadonlyMap<string, BackupVotes>> {
    const entries = [...rounds];
    if (entries.length === 0) {
      return of(new Map());
    }
    // forkJoin: every round's votes are read once, in parallel, and joined at the end.
    return forkJoin(
      entries.map(([storyId, round]) =>
        this.once(this.store.watchCollection(STORE_PATHS.votes(roomId, round))).pipe(
          map((documents) => [storyId, cardsOf(documents)] as const),
        ),
      ),
    ).pipe(map((pairs) => new Map(pairs)));
  }

  private once<T>(source: Observable<T>): Observable<T> {
    return source.pipe(take(1));
  }
}
