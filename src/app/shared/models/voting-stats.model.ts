import { BREAK_CARD, UNSURE_CARD } from '@shared/constants/cards.constants';
import {
  AGREEMENT_LABELS,
  AGREEMENT_THRESHOLDS,
  FULL_PERCENT,
  NO_STAT,
  OUTLIER_CARD_GAP,
  SELF_NAME,
  STAT_PRECISION,
} from '@shared/constants/voting.constants';
import { AgreementLevel } from '@shared/enums/agreement-level.enum';
import { type ScoreBand } from '@shared/enums/score-band.enum';
import { type IBallot } from '@shared/interfaces/i-ballot';
import { Deck } from './deck.model';

/** A median splits the sorted votes in two. */
const HALVES = 2;
/** Fewer numeric votes than this can't disagree. */
const MIN_OUTLIER_VOTES = 2;

/** One bar of the vote distribution. */
export interface IDistributionBar {
  readonly card: string;
  /** `Break` for the break card, else the card itself. */
  readonly label: string;
  readonly count: number;
  /** Bar length relative to the most common card, 0–100. */
  readonly percent: number;
  /** Whether this is (one of) the most common cards. */
  readonly isTop: boolean;
  /** Who voted it, comma-separated. */
  readonly voters: string;
  /** Its third of the deck, for the bar's colour. */
  readonly band: ScoreBand;
}

/**
 * Smart-voting statistics for one revealed round (ported from Room.dc.html): average, median,
 * distribution, agreement, the suggested card, alternatives and a hint for the discussion.
 * Pure: built from the deck and the ballots, with no Angular or store dependency.
 */
export class VotingStats {
  /** Numeric votes, lowest first. */
  private readonly numeric: readonly IBallot[];

  /**
   * @param deck The room's deck.
   * @param ballots Every revealed vote.
   */
  public constructor(
    private readonly deck: Deck,
    private readonly ballots: readonly IBallot[],
  ) {
    this.numeric = ballots
      .filter((ballot) => deck.rankOf(ballot.card) >= 0)
      .sort((a, b) => deck.rankOf(a.card) - deck.rankOf(b.card));
  }

  /** How many numeric votes there are. */
  public get numericCount(): number {
    return this.numeric.length;
  }

  /** The mean of the numeric votes, or `null` when there are none. */
  public get average(): number | null {
    const values = this.values();
    return values.length === 0
      ? null
      : values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /** The median of the numeric votes, or `null` when there are none. */
  public get median(): number | null {
    const values = this.values();
    const middle = Math.floor(values.length / HALVES);
    if (values.length === 0) {
      return null;
    }
    const upper = values.at(middle) ?? 0;
    return values.length % HALVES === 1 ? upper : ((values.at(middle - 1) ?? 0) + upper) / HALVES;
  }

  /** The average as shown: a card on the T-shirt deck, else one decimal place. */
  public get averageLabel(): string {
    return this.format(this.average);
  }

  /** The median as shown, like `averageLabel`. */
  public get medianLabel(): string {
    return this.format(this.median);
  }

  /** The card closest to the average, or `null` when no vote is numeric. */
  public get suggested(): string | null {
    const average = this.average;
    return average === null ? null : this.deck.nearest(average);
  }

  /** Other numeric cards someone voted, to accept instead of the suggestion. */
  public get alternatives(): readonly string[] {
    const voted = new Set(this.numeric.map((ballot) => ballot.card));
    return this.deck.numericCards.filter((card) => voted.has(card) && card !== this.suggested);
  }

  /** Share of numeric votes on the most common card, 0–100. */
  public get agreementPercent(): number {
    if (this.numeric.length === 0) {
      return 0;
    }
    return Math.round((maxCount(countCards(this.numeric)) / this.numeric.length) * FULL_PERCENT);
  }

  /** The agreement percentage as a level. */
  public get agreementLevel(): AgreementLevel {
    const percent = this.agreementPercent;
    if (percent === FULL_PERCENT) {
      return AgreementLevel.Consensus;
    }
    if (percent >= AGREEMENT_THRESHOLDS.strong) {
      return AgreementLevel.Strong;
    }
    return percent >= AGREEMENT_THRESHOLDS.some ? AgreementLevel.Some : AgreementLevel.Wide;
  }

  /** The agreement level in words. */
  public get agreementLabel(): string {
    return AGREEMENT_LABELS[this.agreementLevel];
  }

  /** Everyone who voted a number agrees, and there are at least two of them. */
  public get isConsensus(): boolean {
    return this.agreementPercent === FULL_PERCENT && this.numeric.length > 1;
  }

  /** Every voted card in deck order, with how many chose it. */
  public get distribution(): readonly IDistributionBar[] {
    const counts = countCards(this.ballots);
    const top = Math.max(1, maxCount(counts));
    return this.deck.cards
      .filter((card) => counts.has(card))
      .map((card) => {
        const count = counts.get(card) ?? 0;
        return {
          card,
          label: card === BREAK_CARD ? 'Break' : card,
          count,
          percent: Math.round((count / top) * FULL_PERCENT),
          isTop: count === top,
          voters: this.votersOf(card),
          band: this.deck.bandOf(card),
        };
      });
  }

  /**
   * What to talk about before accepting: the two furthest-apart voters when they are at least
   * two cards apart, otherwise how many are unsure; `null` when neither applies.
   */
  public get hint(): string | null {
    return this.outlierHint() ?? this.unsureHint();
  }

  private outlierHint(): string | null {
    const low = this.numeric[0];
    const high = this.numeric[this.numeric.length - 1];
    if (low === undefined || high === undefined || this.numeric.length < MIN_OUTLIER_VOTES) {
      return null;
    }
    if (this.deck.rankOf(high.card) - this.deck.rankOf(low.card) < OUTLIER_CARD_GAP) {
      return null;
    }
    return (
      `${nameOf(low)} (${low.card}) and ${nameOf(high)} (${high.card}) are furthest apart. ` +
      'Hear them both out, then vote again.'
    );
  }

  private unsureHint(): string | null {
    const unsure = this.ballots.filter((ballot) => ballot.card === UNSURE_CARD).length;
    if (unsure === 0) {
      return null;
    }
    const who = unsure === 1 ? '1 person is' : `${String(unsure)} people are`;
    return `${who} unsure. Clarify the story before accepting.`;
  }

  /** @returns The numeric votes' values, lowest first. */
  private values(): number[] {
    return this.numeric.map((ballot) => Deck.valueOf(ballot.card) ?? 0);
  }

  private votersOf(card: string): string {
    return this.ballots
      .filter((ballot) => ballot.card === card)
      .map((ballot) => ballot.voterName)
      .join(', ');
  }

  private format(value: number | null): string {
    if (value === null) {
      return NO_STAT;
    }
    if (this.deck.showsCardsForNumbers) {
      return this.deck.nearest(value) ?? NO_STAT;
    }
    return (Math.round(value * STAT_PRECISION) / STAT_PRECISION).toString();
  }
}

/** @returns How many ballots chose each card. */
function countCards(ballots: readonly IBallot[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ballot of ballots) {
    counts.set(ballot.card, (counts.get(ballot.card) ?? 0) + 1);
  }
  return counts;
}

/** @returns The largest count, or 0 for none. */
function maxCount(counts: ReadonlyMap<string, number>): number {
  return Math.max(0, ...counts.values());
}

/** @returns The voter's name as hints show it. */
function nameOf(ballot: IBallot): string {
  return ballot.isMine ? SELF_NAME : ballot.voterName;
}
