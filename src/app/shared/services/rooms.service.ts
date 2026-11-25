import { Service, inject } from '@angular/core';
import { type Observable, defer, map, retry, take } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { IRealtimeStore, SERVER_TIME, type StoreWrite } from '@core/interfaces/i-realtime-store';
import { RANDOM } from '@core/tokens/random.token';
import { DEFAULT_DECK } from '@shared/constants/decks.constants';
import { DEFAULT_ROOM_NAME, ROOM_CREATE_ATTEMPTS } from '@shared/constants/room.constants';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { type ISeatProfile } from '@shared/interfaces/i-seat-profile';
import { Room } from '@shared/models/room.model';
import { FieldReader } from '@shared/utils/fields.util';
import { createRoomCode, createRoomId } from '@shared/utils/room-id.util';
import { participantFields } from './participant-fields';
import { TIMER_LIMITS } from '@shared/constants/timer.constants';

/** A room to create, and its moderator's seat. */
export interface INewRoom {
  /** The room's name; `Planning poker` when empty. */
  readonly name: string;
  readonly moderatorUid: string;
  readonly moderator: ISeatProfile;
}

/**
 * Rooms and their codes (`rooms/{roomId}`, `roomCodes/{code}`). Shared by the landing page (create,
 * find by code), the join form (preview) and the room itself (ADR-0011).
 */
@Service()
export class RoomsService {
  private readonly store = inject(IRealtimeStore);
  private readonly random = inject(RANDOM);

  /**
   * @param roomId The room.
   * @returns The room after every change, or `null` when there is none.
   */
  public watch(roomId: string): Observable<Room | null> {
    return this.store
      .watchDocument(STORE_PATHS.room(roomId))
      .pipe(map((fields) => (fields === null ? null : new Room(roomId, fields))));
  }

  /**
   * Creates the room, its code and the moderator's seat in one commit.
   * @param room What to create.
   * @returns The new room's id, once.
   */
  public create(room: INewRoom): Observable<string> {
    // defer: a retry draws a new id and code, in case the random code was already taken.
    return defer(() => {
      const name = room.name.trim() || DEFAULT_ROOM_NAME;
      const roomId = createRoomId(name, this.random);
      const code = createRoomCode(this.random);
      return this.store
        .commit(this.creationWrites(roomId, code, name, room))
        .pipe(map(() => roomId));
    }).pipe(retry(ROOM_CREATE_ATTEMPTS - 1));
  }

  /**
   * @param code A normalised room code, e.g. `X7K2-92`.
   * @returns The id of the room with that code, or `null`; once.
   */
  public findRoomId(code: string): Observable<string | null> {
    return this.store.watchDocument(STORE_PATHS.roomCode(code)).pipe(
      take(1),
      map((fields) => (fields === null ? null : FieldReader.textOrNull(fields, 'roomId'))),
    );
  }

  private creationWrites(roomId: string, code: string, name: string, room: INewRoom): StoreWrite[] {
    return [
      {
        kind: StoreWriteKind.Set,
        path: STORE_PATHS.room(roomId),
        fields: {
          name,
          code,
          moderatorUid: room.moderatorUid,
          moderatorName: room.moderator.displayName,
          deck: DEFAULT_DECK,
          autoReveal: true,
          spectatorsByDefault: false,
          activeStoryId: null,
          round: 1,
          revealed: false,
          roundStartedAt: SERVER_TIME,
          timerSeconds: TIMER_LIMITS.defaultSeconds,
          lockOnTimeUp: true,
          createdAt: SERVER_TIME,
        },
      },
      { kind: StoreWriteKind.Set, path: STORE_PATHS.roomCode(code), fields: { roomId } },
      {
        kind: StoreWriteKind.Set,
        path: STORE_PATHS.participant(roomId, room.moderatorUid),
        fields: participantFields(room.moderator),
      },
    ];
  }
}
