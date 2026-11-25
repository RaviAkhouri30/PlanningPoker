import { ScoreBand } from '@shared/enums/score-band.enum';

/** One entry of the results chart's colour key. */
export interface IScoreLegendItem {
  readonly band: ScoreBand;
  readonly label: string;
}

/** The results chart's colour key, low to high, then no score. */
export const SCORE_LEGEND: readonly IScoreLegendItem[] = [
  { band: ScoreBand.Low, label: 'Low' },
  { band: ScoreBand.Mid, label: 'Middle' },
  { band: ScoreBand.High, label: 'High' },
  { band: ScoreBand.None, label: 'No score' },
];
