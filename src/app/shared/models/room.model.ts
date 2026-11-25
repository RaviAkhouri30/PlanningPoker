import { type StoreFields } from '@core/interfaces/i-realtime-store';
import { DEFAULT_DECK } from '@shared/constants/decks.constants';
import { MS_PER_SECOND, TIMER_LIMITS } from '@shared/constants/timer.constants';
import { DeckType } from '@shared/enums/deck-type.enum';
import { FieldReader } from '@shared/utils/fields.util';
import { Deck } from './deck.model';

const DECK_TYPES = Object.values(DeckType);

/** A planning room (`rooms/{roomId}`), the shared state of the table. */
export class Room {
  public readonly name: string;
  public readonly code: string;
  public readonly moderatorUid: string;
  public readonly moderatorName: string;
  public readonly deckType: DeckType;
  public readonly autoReveal: boolean;
  public readonly spectatorsByDefault: boolean;
  public readonly activeStoryId: string | null;
  /** Grows by one on every new round; votes are stored per round. */
  public readonly round: number;
  /** Whether the current round's cards are face up. */
  public readonly revealed: boolean;
  /** When the round's countdown started, in ms; `null` until the server has stamped it. */
  public readonly roundStartedAt: number | null;
  /** How long the countdown runs, in seconds. */
  public readonly timerSeconds: number;
  /** Whether voting stops when the countdown reaches zero (until the timer is reset). */
  public readonly lockOnTimeUp: boolean;
  /** The cards this room votes with. */
  public readonly deck: Deck;

  /**
   * @param id The room's id, as in its link.
   * @param fields The stored document.
   */
  public constructor(
    public readonly id: string,
    fields: StoreFields,
  ) {
    this.name = FieldReader.text(fields, 'name');
    this.code = FieldReader.text(fields, 'code');
    this.moderatorUid = FieldReader.text(fields, 'moderatorUid');
    this.moderatorName = FieldReader.text(fields, 'moderatorName');
    this.deckType = FieldReader.oneOf(fields, 'deck', DECK_TYPES, DEFAULT_DECK);
    this.autoReveal = FieldReader.flag(fields, 'autoReveal', true);
    this.spectatorsByDefault = FieldReader.flag(fields, 'spectatorsByDefault');
    this.activeStoryId = FieldReader.textOrNull(fields, 'activeStoryId');
    this.round = FieldReader.number(fields, 'round', 1);
    this.revealed = FieldReader.flag(fields, 'revealed');
    this.roundStartedAt = FieldReader.numberOrNull(fields, 'roundStartedAt');
    this.timerSeconds = FieldReader.number(fields, 'timerSeconds', TIMER_LIMITS.defaultSeconds);
    this.lockOnTimeUp = FieldReader.flag(fields, 'lockOnTimeUp', true);
    this.deck = new Deck(this.deckType);
  }

  /**
   * @param now The current time, in ms.
   * @returns Whole seconds left on the countdown (rounded up), never negative; the full
   *   countdown while the server hasn't stamped the start yet.
   */
  public secondsLeft(now: number): number {
    if (this.roundStartedAt === null) {
      return this.timerSeconds;
    }
    const left = this.roundStartedAt + this.timerSeconds * MS_PER_SECOND - now;
    // Clamped at the top too: the server stamps the round a moment after this tab's last tick
    // (and clocks drift), which would otherwise show a second more than the countdown has.
    return Math.min(this.timerSeconds, Math.max(0, Math.ceil(left / MS_PER_SECOND)));
  }

  /**
   * @param now The current time, in ms.
   * @returns Whether voting is closed because the countdown ran out (the rules agree).
   */
  public isVotingLocked(now: number): boolean {
    return this.lockOnTimeUp && !this.revealed && this.secondsLeft(now) === 0;
  }

  /** @returns Whether `uid` moderates this room. */
  public isModeratedBy(uid: string | null | undefined): boolean {
    return uid !== null && uid !== undefined && uid === this.moderatorUid;
  }
}
