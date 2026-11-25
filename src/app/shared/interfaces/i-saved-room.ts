import { type RoomRole } from '@shared/enums/room-role.enum';

/** A room this browser has been in, as My rooms lists it. */
export interface ISavedRoom {
  /** The room id, as in `/r/<id>`. */
  readonly id: string;
  readonly name: string;
  /** The join code, e.g. `X7K2-92`. */
  readonly code: string;
  readonly role: RoomRole;
  /** When this browser last opened it, in ms since the epoch. */
  readonly lastVisit: number;
}
