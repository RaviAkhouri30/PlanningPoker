import { type StoreFields } from '@core/interfaces/i-realtime-store';
import {
  AVATAR_PALETTE,
  DEFAULT_AVATAR_COLOUR,
  type IAvatarColour,
} from '@shared/constants/palette.constants';
import { Animal } from '@shared/enums/animal.enum';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { initialsOf } from '@shared/utils/display.util';
import { FieldReader } from '@shared/utils/fields.util';

const ROLES = Object.values(ParticipantRole);
const ANIMAL_IDS = Object.values(Animal);

/** Someone in a room (`rooms/{roomId}/participants/{uid}`). */
export class Participant {
  public readonly displayName: string;
  /** Index into `AVATAR_PALETTE`. */
  public readonly colourIndex: number;
  public readonly role: ParticipantRole;
  /** The animal on the avatar, or `null` for a seat from before avatars (shown as initials). */
  public readonly avatar: Animal | null;
  /** The round this person last voted in; equal to the room's round means "has voted". */
  public readonly votedRound: number | null;
  public readonly joinedAt: number | null;
  public readonly lastSeenAt: number | null;

  /**
   * @param uid The person's account id (also the document id).
   * @param fields The stored document.
   */
  public constructor(
    public readonly uid: string,
    fields: StoreFields,
  ) {
    this.displayName = FieldReader.text(fields, 'displayName');
    this.colourIndex = FieldReader.number(fields, 'colour');
    this.role = FieldReader.oneOf(fields, 'role', ROLES, ParticipantRole.Player);
    this.avatar = FieldReader.oneOfOrNull(fields, 'avatar', ANIMAL_IDS);
    this.votedRound = FieldReader.numberOrNull(fields, 'votedRound');
    this.joinedAt = FieldReader.numberOrNull(fields, 'joinedAt');
    this.lastSeenAt = FieldReader.numberOrNull(fields, 'lastSeenAt');
  }

  /** The avatar's colours (the first swatch when the stored index is out of range). */
  public get colour(): IAvatarColour {
    return AVATAR_PALETTE[this.colourIndex] ?? DEFAULT_AVATAR_COLOUR;
  }

  /** Up to two initials for the avatar. */
  public get initials(): string {
    return initialsOf(this.displayName);
  }

  /** Whether this person votes. */
  public get isPlayer(): boolean {
    return this.role === ParticipantRole.Player;
  }

  /** @returns Whether this person has voted in `round`. */
  public hasVotedIn(round: number): boolean {
    return this.votedRound === round;
  }

  /** @returns Whether this person was seen within `windowMs` of `now`. */
  public isOnline(now: number, windowMs: number): boolean {
    return this.lastSeenAt !== null && now - this.lastSeenAt <= windowMs;
  }
}
