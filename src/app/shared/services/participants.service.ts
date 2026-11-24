import { Service, inject } from '@angular/core';
import { type Observable, map, switchMap, take } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { IRealtimeStore, SERVER_TIME } from '@core/interfaces/i-realtime-store';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { type ISeatProfile } from '@shared/interfaces/i-seat-profile';
import { Participant } from '@shared/models/participant.model';
import { participantFields } from './participant-fields';

/** The people in a room (`rooms/{roomId}/participants/{uid}`), shared by the join form and the room. */
@Service()
export class ParticipantsService {
  private readonly store = inject(IRealtimeStore);

  /**
   * @param roomId The room.
   * @returns Everyone in the room, in the order they joined, after every change.
   */
  public watchAll(roomId: string): Observable<readonly Participant[]> {
    return this.store
      .watchCollection(STORE_PATHS.participants(roomId), 'joinedAt')
      .pipe(map((documents) => documents.map((item) => new Participant(item.id, item.fields))));
  }

  /**
   * @param roomId The room.
   * @param uid The person.
   * @returns Their seat after every change, or `null` while they aren't in the room.
   */
  public watchOne(roomId: string, uid: string): Observable<Participant | null> {
    return this.store
      .watchDocument(STORE_PATHS.participant(roomId, uid))
      .pipe(map((fields) => (fields === null ? null : new Participant(uid, fields))));
  }

  /**
   * Takes a seat, or updates the seat someone already has (rejoining keeps when they joined).
   * @param roomId The room.
   * @param uid The person.
   * @param profile Name, colour and role.
   * @returns Completes once stored.
   */
  public join(roomId: string, uid: string, profile: ISeatProfile): Observable<void> {
    const path = STORE_PATHS.participant(roomId, uid);
    return this.store.watchDocument(path).pipe(
      take(1),
      // take(1) means one inner commit; switchMap never has two to choose between.
      switchMap((existing) =>
        this.store.commit([
          existing === null
            ? { kind: StoreWriteKind.Set, path, fields: participantFields(profile) }
            : {
                kind: StoreWriteKind.Update,
                path,
                fields: { ...profile, lastSeenAt: SERVER_TIME },
              },
        ]),
      ),
    );
  }

  /**
   * Tells the room this person is still there.
   * @returns Completes once stored.
   */
  public heartbeat(roomId: string, uid: string): Observable<void> {
    return this.store.commit([
      {
        kind: StoreWriteKind.Update,
        path: STORE_PATHS.participant(roomId, uid),
        fields: { lastSeenAt: SERVER_TIME },
      },
    ]);
  }
}
