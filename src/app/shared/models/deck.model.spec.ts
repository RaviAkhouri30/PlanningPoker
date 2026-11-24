import { DeckType } from '@shared/enums/deck-type.enum';
import { Deck } from './deck.model';

describe('Deck', () => {
  it.each([
    ['½', 0.5],
    ['13', 13],
    ['XL', 8],
    ['?', null],
    ['break', null],
    ['1.5', null],
  ])('should read %s as %s', (card, value) => {
    expect(Deck.valueOf(card)).toBe(value);
  });

  it('should leave ? and break out of the numeric cards', () => {
    expect(new Deck(DeckType.PowersOfTwo).numericCards).toEqual([
      '0',
      '1',
      '2',
      '4',
      '8',
      '16',
      '32',
      '64',
    ]);
  });

  it('should pick the higher card when a value sits between two', () => {
    expect(new Deck(DeckType.ModifiedFibonacci).nearest(4)).toBe('5');
  });

  it('should pick the closest card when one is closer', () => {
    expect(new Deck(DeckType.Fibonacci).nearest(6)).toBe('5');
  });

  it('should show T-shirt averages as cards', () => {
    expect(new Deck(DeckType.TShirt).showsCardsForNumbers).toBe(true);
    expect(new Deck(DeckType.Fibonacci).showsCardsForNumbers).toBe(false);
  });

  it('should know its cards and their rank', () => {
    const deck = new Deck(DeckType.TShirt);

    expect(deck.label).toBe('T-shirt');
    expect(deck.has('M')).toBe(true);
    expect(deck.has('5')).toBe(false);
    expect(deck.rankOf('L')).toBe(3);
    expect(deck.rankOf('?')).toBe(-1);
  });
});
