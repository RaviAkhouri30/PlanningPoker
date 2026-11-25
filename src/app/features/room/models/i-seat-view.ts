import { type ScoreBand } from '@shared/enums/score-band.enum';

/** What a seat's card slot shows. */
export enum SeatSlot {
  /** Still choosing: animated dots. */
  Thinking = 'thinking',
  /** Voted: a card, face down until the flip. */
  Card = 'card',
  /** No vote and none coming (revealed, or no story): a dash. */
  Empty = 'empty',
}

/** One person as the table and the players panel show them. */
export interface ISeatView {
  readonly uid: string;
  /** "You", or the first name. */
  readonly shortName: string;
  /** The full name, "(you)" added for this person. */
  readonly fullName: string;
  readonly colour: number;
  readonly isMe: boolean;
  readonly isPlayer: boolean;
  /** e.g. "Moderator · player". */
  readonly roleLabel: string;
  readonly online: boolean;
  readonly slot: SeatSlot;
  /** The card, once revealed. */
  readonly card: string | null;
  /** The card's third of the deck once revealed; `None` before the flip or with no vote. */
  readonly band: ScoreBand;
  /** e.g. "Voted 5", "Thinking…". */
  readonly status: string;
  /** Stagger for the flip, in ms. */
  readonly flipDelay: number;
}
