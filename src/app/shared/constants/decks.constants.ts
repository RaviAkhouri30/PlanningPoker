import { DeckType } from '@shared/enums/deck-type.enum';
import { BREAK_CARD, HALF_CARD, UNSURE_CARD } from './cards.constants';

/** One deck as the design defines it. */
export interface IDeckDefinition {
  readonly label: string;
  /** Every card, in the order the deck shows them. */
  readonly cards: readonly string[];
}

/** The four decks from the design (Room.dc.html). Mirrored by `deckCards()` in firestore.rules. */
export const DECKS: Readonly<Record<DeckType, IDeckDefinition>> = {
  [DeckType.ModifiedFibonacci]: {
    label: 'Modified Fibonacci',
    cards: [
      '0',
      HALF_CARD,
      '1',
      '2',
      '3',
      '5',
      '8',
      '13',
      '20',
      '40',
      '100',
      UNSURE_CARD,
      BREAK_CARD,
    ],
  },
  [DeckType.Fibonacci]: {
    label: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', UNSURE_CARD, BREAK_CARD],
  },
  [DeckType.TShirt]: {
    label: 'T-shirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', UNSURE_CARD, BREAK_CARD],
  },
  [DeckType.PowersOfTwo]: {
    label: 'Powers of 2',
    cards: ['0', '1', '2', '4', '8', '16', '32', '64', UNSURE_CARD, BREAK_CARD],
  },
};

/** @returns The definition of deck `type` (a lookup the type system proves total). */
export function deckDefinition(type: DeckType): IDeckDefinition {
  switch (type) {
    case DeckType.Fibonacci:
      return DECKS.fib;
    case DeckType.TShirt:
      return DECKS.tshirt;
    case DeckType.PowersOfTwo:
      return DECKS.pow2;
    case DeckType.ModifiedFibonacci:
      return DECKS.mfib;
  }
}

/** The deck a new room starts with. */
export const DEFAULT_DECK = DeckType.ModifiedFibonacci;

/** How many cards the deck picker shows as a sample. */
export const DECK_SAMPLE_SIZE = 7;
