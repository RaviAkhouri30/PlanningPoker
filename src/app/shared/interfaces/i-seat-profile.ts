import { type ParticipantRole } from '@shared/enums/participant-role.enum';

/** How someone appears in a room, as chosen on the join form. */
export interface ISeatProfile {
  readonly displayName: string;
  /** Index into `AVATAR_PALETTE`. */
  readonly colour: number;
  readonly role: ParticipantRole;
}
