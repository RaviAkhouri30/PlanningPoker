import { AgreementLevel } from '@shared/enums/agreement-level.enum';

/** Agreement percentages at which each level starts (Room.dc.html). */
export const AGREEMENT_THRESHOLDS = { strong: 67, some: 40 } as const;

/** A percentage of everyone. */
export const FULL_PERCENT = 100;

/** Numeric votes this many cards apart (or more) prompt the outlier hint. */
export const OUTLIER_CARD_GAP = 2;

/** One decimal place for averages and medians. */
export const STAT_PRECISION = 10;

/** Shown for a statistic with no numeric votes. */
export const NO_STAT = '–';

/** Words for each agreement level, as the results panel shows them. */
export const AGREEMENT_LABELS: Readonly<Record<AgreementLevel, string>> = {
  [AgreementLevel.Consensus]: 'Full consensus',
  [AgreementLevel.Strong]: 'Strong agreement',
  [AgreementLevel.Some]: 'Some disagreement',
  [AgreementLevel.Wide]: 'Wide spread',
};

/** How the room names the current person in hints. */
export const SELF_NAME = 'You';
