/** The "not sure" card: counts as a vote, never as a number. */
export const UNSURE_CARD = '?';

/** The "I need a break" card: counts as a vote, never as a number. */
export const BREAK_CARD = 'break';

/** The half-point card of the Modified Fibonacci deck. */
export const HALF_CARD = '½';

/** Numeric worth of the half-point card. */
export const HALF_CARD_VALUE = 0.5;

/** T-shirt sizes as points, so averages and suggestions work on that deck too. */
const TSHIRT_SIZES = { XS: 1, S: 2, M: 3, L: 5, XL: 8, XXL: 13 } as const;

export const TSHIRT_POINTS: ReadonlyMap<string, number> = new Map(Object.entries(TSHIRT_SIZES));
