/** A source of random numbers in [0, 1), injectable so tests are deterministic (`RANDOM`). */
export type RandomSource = () => number;
