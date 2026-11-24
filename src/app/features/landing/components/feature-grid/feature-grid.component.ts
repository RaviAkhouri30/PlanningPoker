import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { FEATURES, SMART_VOTING } from '../../models/landing-content.constants';

/** "Features": smart voting on the dark table colour, then one card per feature. */
@Component({
  selector: 'app-feature-grid',
  imports: [IconComponent],
  templateUrl: './feature-grid.component.html',
  styleUrl: './feature-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureGridComponent {
  protected readonly smart = SMART_VOTING;
  protected readonly features = FEATURES;
  protected readonly sparkleIcon = IconName.Sparkle;
  /** The smart-voting chip drawn in the accent colour. */
  protected readonly suggestedChip = 2;
  /** The smart-voting chip drawn as a hint. */
  protected readonly hintChip = 3;
}
