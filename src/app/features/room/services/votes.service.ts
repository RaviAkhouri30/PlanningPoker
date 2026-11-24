import { Service, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { IRealtimeStore, SERVER_TIME } from '@core/interfaces/i-realtime-store';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { FieldReader } from '@shared/utils/fields.util';

/** Every revealed card of a round, by voter uid. */
export type RoundVotes = ReadonlyMap<string, string>;

/**
 * Votes (`rooms/{roomId}/rounds/{round}/votes/{uid}`). A vote is secret until its round is
 * revealed: the rules let people read only their own until `rounds/{round}` exists (ADR-0008),
 * and the room sees who has voted through `participants/{uid}.votedRound`.
 */
@Service()
export class VotesService {
  private readonly store = inject(IRealtimeStore);

  /**
   * Casts or changes this person's vote, and marks them as voted, in one batch.
   * @returns Completes once stored.
   */
  public cast(roomId: string, round: number, uid: string, card: string): Observable<void> {
    return this.store.commit([
      {
        kind: StoreWriteKind.Set,
        path: STORE_PATHS.vote(roomId, round, uid),
        fields: { value: card, castAt: SERVER_TIME },
      },
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.participant(roomId, uid),
        fields: { votedRound: round },
      },
    ]);
  }

  /**
   * Takes this person's vote back.
   * @returns Completes once stored.
   */
  public retract(roomId: string, round: number, uid: string): Observable<void> {
    return this.store.commit([
      { kind: StoreWriteKind.Delete, path: STORE_PATHS.vote(roomId, round, uid) },
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.participant(roomId, uid),
        fields: { votedRound: null },
      },
    ]);
  }

  /** @returns This person's card in `round` after every change, or `null` before they vote. */
  public watchMine(roomId: string, round: number, uid: string): Observable<string | null> {
    return this.store
      .watchDocument(STORE_PATHS.vote(roomId, round, uid))
      .pipe(map((fields) => (fields === null ? null : FieldReader.textOrNull(fields, 'value'))));
  }

  /**
   * Every card of a revealed round. Only subscribe once the round is revealed; before that the
   * rules refuse the read.
   */
  public watchRound(roomId: string, round: number): Observable<RoundVotes> {
    return this.store.watchCollection(STORE_PATHS.votes(roomId, round)).pipe(
      map(
        (documents) =>
          new Map(
            documents.flatMap((item) => {
              const card = FieldReader.textOrNull(item.fields, 'value');
              return card === null ? [] : [[item.id, card] as const];
            }),
          ),
      ),
    );
  }
}
