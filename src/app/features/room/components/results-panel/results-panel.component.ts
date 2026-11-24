import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { FULL_PERCENT } from '@shared/constants/voting.constants';
import { WidthPercentDirective } from '@shared/directives/width-percent.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { type VotingStats } from '@shared/models/voting-stats.model';
import { ConfettiBurstComponent } from '../confetti-burst/confetti-burst.component';

/** The agreement ring's circumference (r = 34), from the design. */
const RING_LENGTH = 213.6;

/** After the flip: average, distribution, agreement, the hint, and the moderator's choices. */
@Component({
  selector: 'app-results-panel',
  imports: [IconComponent, WidthPercentDirective, ConfettiBurstComponent],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanelComponent {
  public readonly stats = input.required<VotingStats>();
  /** Whether the moderator's buttons show. */
  public readonly isModerator = input(false);

  /** Accept a card as the estimate. */
  public readonly accept = output<string>();
  /** Vote on the same story again. */
  public readonly voteAgain = output();

  protected readonly ringLength = RING_LENGTH;
  protected readonly ringOffset = computed(() =>
    (RING_LENGTH * (1 - this.stats().agreementPercent / FULL_PERCENT)).toFixed(1),
  );
  protected readonly checkIcon = IconName.Check;
  protected readonly refreshIcon = IconName.Refresh;
  protected readonly alertIcon = IconName.Alert;
}
