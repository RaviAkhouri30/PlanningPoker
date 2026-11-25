/**
 * Where a card sits in its deck, for the results' colours: the deck's number cards split into
 * thirds (low green, middle yellow, high red); `?`, the break card and no vote are grey.
 */
export enum ScoreBand {
  Low = 'low',
  Mid = 'mid',
  High = 'high',
  None = 'none',
}
