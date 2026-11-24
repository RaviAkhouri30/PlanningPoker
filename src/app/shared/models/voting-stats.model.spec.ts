import { AgreementLevel } from '@shared/enums/agreement-level.enum';
import { DeckType } from '@shared/enums/deck-type.enum';
import { type IBallot } from '@shared/interfaces/i-ballot';
import { Deck } from './deck.model';
import { VotingStats } from './voting-stats.model';

/** Ballots named A, B, C… in order, the first one mine when `mineFirst`. */
function ballots(cards: readonly string[], mineFirst = false): IBallot[] {
  return cards.map((card, index) => ({
    voterName: String.fromCharCode(65 + index),
    isMine: mineFirst && index === 0,
    card,
  }));
}

function stats(
  cards: readonly string[],
  deck = DeckType.ModifiedFibonacci,
  mineFirst = false,
): VotingStats {
  return new VotingStats(new Deck(deck), ballots(cards, mineFirst));
}

describe('VotingStats', () => {
  it('should average and take the median of the numeric votes only', () => {
    const result = stats(['3', '5', '8', '?', 'break']);

    expect(result.numericCount).toBe(3);
    expect(result.averageLabel).toBe('5.3');
    expect(result.medianLabel).toBe('5');
  });

  it('should take the middle pair for the median when the count is even', () => {
    expect(stats(['2', '3', '5', '8']).median).toBe(4);
  });

  it('should show no statistics when no vote is numeric', () => {
    const result = stats(['?', 'break']);

    expect(result.average).toBeNull();
    expect(result.median).toBeNull();
    expect(result.averageLabel).toBe('–');
    expect(result.suggested).toBeNull();
    expect(result.agreementPercent).toBe(0);
  });

  it('should suggest the card closest to the average', () => {
    expect(stats(['5', '5', '8']).suggested).toBe('5');
  });

  it('should show T-shirt averages as the nearest size', () => {
    const result = stats(['S', 'M', 'L'], DeckType.TShirt);

    expect(result.averageLabel).toBe('M');
    expect(result.medianLabel).toBe('M');
  });

  it('should offer the other voted numbers as alternatives', () => {
    expect(stats(['3', '5', '5', '8']).alternatives).toEqual(['3', '8']);
  });

  it.each([
    [['5', '5', '5'], 100, AgreementLevel.Consensus],
    [['5', '5', '8'], 67, AgreementLevel.Strong],
    [['3', '5', '5', '8', '13'], 40, AgreementLevel.Some],
    [['1', '2', '3', '5'], 25, AgreementLevel.Wide],
  ])('should rate %o at %i%% (%s)', (cards, percent, level) => {
    const result = stats(cards);

    expect(result.agreementPercent).toBe(percent);
    expect(result.agreementLevel).toBe(level);
  });

  it('should label the agreement level in words', () => {
    expect(stats(['5', '5']).agreementLabel).toBe('Full consensus');
  });

  it('should call it consensus only with two or more agreeing votes', () => {
    expect(stats(['5', '5']).isConsensus).toBe(true);
    expect(stats(['5']).isConsensus).toBe(false);
  });

  it('should count every card in deck order with its voters', () => {
    expect(stats(['8', '5', 'break', '5']).distribution).toEqual([
      { card: '5', label: '5', count: 2, percent: 100, isTop: true, voters: 'B, D' },
      { card: '8', label: '8', count: 1, percent: 50, isTop: false, voters: 'A' },
      { card: 'break', label: 'Break', count: 1, percent: 50, isTop: false, voters: 'C' },
    ]);
  });

  it('should name the furthest-apart voters when they are two cards apart', () => {
    expect(stats(['3', '5', '8'], DeckType.ModifiedFibonacci, true).hint).toBe(
      'You (3) and C (8) are furthest apart. Hear them both out, then vote again.',
    );
  });

  it('should count the unsure when nobody is far apart', () => {
    expect(stats(['5', '?']).hint).toBe('1 person is unsure. Clarify the story before accepting.');
    expect(stats(['5', '?', '?']).hint).toBe(
      '2 people are unsure. Clarify the story before accepting.',
    );
  });

  it('should give no hint when votes are close and nobody is unsure', () => {
    expect(stats(['5', '8']).hint).toBeNull();
    expect(stats(['5']).hint).toBeNull();
  });
});
