import { HALF_CARD, HALF_CARD_VALUE, TSHIRT_POINTS } from '@shared/constants/cards.constants';
import { deckDefinition } from '@shared/constants/decks.constants';
import { DeckType } from '@shared/enums/deck-type.enum';
import { ScoreBand } from '@shared/enums/score-band.enum';

/** Slack for comparing floating-point distances, so ties are recognised as ties. */
const EPSILON = 1e-9;

/** The number cards split into this many bands: low, middle, high. */
const BANDS = 3;
const MID_BAND = 1;
const HIGH_BAND = 2;

/** A deck of cards with the numeric meaning the stats need (ported from Room.dc.html). */
export class Deck {
  /** Every card, in display order. */
  public readonly cards: readonly string[];

  /** The cards that have a number, in display order (no `?` or break). */
  public readonly numericCards: readonly string[];

  /** The deck's name, e.g. `Modified Fibonacci`. */
  public readonly label: string;

  /** @param type Which deck. */
  public constructor(public readonly type: DeckType) {
    const definition = deckDefinition(type);
    this.label = definition.label;
    this.cards = definition.cards;
    this.numericCards = this.cards.filter((card) => Deck.valueOf(card) !== null);
  }

  /** Whether averages are shown as the nearest card instead of a number. */
  public get showsCardsForNumbers(): boolean {
    return this.type === DeckType.TShirt;
  }

  /**
   * @param card A card label.
   * @returns Its number, or `null` for `?`, the break card or anything unknown.
   */
  public static valueOf(card: string): number | null {
    if (card === HALF_CARD) {
      return HALF_CARD_VALUE;
    }
    const tshirt = TSHIRT_POINTS.get(card);
    if (tshirt !== undefined) {
      return tshirt;
    }
    return /^\d+$/.test(card) ? Number(card) : null;
  }

  /** @returns Whether `card` belongs to this deck. */
  public has(card: string): boolean {
    return this.cards.includes(card);
  }

  /**
   * @param value Any number, e.g. an average.
   * @returns The numeric card closest to it; on a tie the higher card, as the design does.
   */
  public nearest(value: number): string | null {
    let best: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const card of this.numericCards) {
      const distance = Math.abs((Deck.valueOf(card) ?? 0) - value);
      if (distance <= bestDistance + EPSILON) {
        bestDistance = distance;
        best = card;
      }
    }
    return best;
  }

  /** @returns The position of `card` among the numeric cards, or -1. */
  public rankOf(card: string): number {
    return this.numericCards.indexOf(card);
  }

  /**
   * @param card A card label, or `null` for no vote.
   * @returns Its third of the deck's number cards; `None` for `?`, the break card or no vote.
   */
  public bandOf(card: string | null): ScoreBand {
    const rank = card === null ? -1 : this.rankOf(card);
    if (rank < 0) {
      return ScoreBand.None;
    }
    const band = Math.floor((rank * BANDS) / this.numericCards.length);
    if (band >= HIGH_BAND) {
      return ScoreBand.High;
    }
    return band === MID_BAND ? ScoreBand.Mid : ScoreBand.Low;
  }
}
