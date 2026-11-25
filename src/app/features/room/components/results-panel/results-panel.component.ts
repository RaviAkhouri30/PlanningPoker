import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { FULL_PERCENT } from '@shared/constants/voting.constants';
import { WidthPercentDirective } from '@shared/directives/width-percent.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { type VotingStats } from '@shared/models/voting-stats.model';
import { SCORE_LEGEND } from '../../models/score-legend.constants';
import { ConfettiBurstComponent } from '../confetti-burst/confetti-burst.component';
import { CustomEstimateComponent } from '../custom-estimate/custom-estimate.component';

/** The agreement ring's circumference (r = 34), from the design. */
const RING_LENGTH = 213.6;

/**
 * After the flip: average, the votes per card coloured by their third of the deck (grey for no
 * vote), agreement, the hint, and the moderator's choices, including an estimate of their own.
 */
@Component({
  selector: 'app-results-panel',
  imports: [IconComponent, WidthPercentDirective, ConfettiBurstComponent, CustomEstimateComponent],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanelComponent {
  public readonly stats = input.required<VotingStats>();
  /** Players with no card after the flip, shown as a grey bar. */
  public readonly noVoteCount = input(0);
  /** Whether the moderator's buttons show. */
  public readonly isModerator = input(false);

  /** Accept a card, or a value the moderator typed, as the estimate. */
  public readonly accept = output<string>();
  /** Vote on the same story again. */
  public readonly voteAgain = output();

  protected readonly ringLength = RING_LENGTH;
  protected readonly legend = SCORE_LEGEND;
  /** The grey bar's length, against the most common card like the others. */
  protected readonly noVotePercent = computed(() => {
    const top = Math.max(1, ...this.stats().distribution.map((bar) => bar.count));
    return Math.min(FULL_PERCENT, Math.round((this.noVoteCount() / top) * FULL_PERCENT));
  });
  protected readonly ringOffset = computed(() =>
    (RING_LENGTH * (1 - this.stats().agreementPercent / FULL_PERCENT)).toFixed(1),
  );
  protected readonly checkIcon = IconName.Check;
  protected readonly refreshIcon = IconName.Refresh;
  protected readonly alertIcon = IconName.Alert;
}
