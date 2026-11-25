import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DelayDirective } from '@shared/directives/delay.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { FAN, STAGE_BOTTOM, STAGE_JOINS, STAGE_TOP } from '../../models/hero-stage.constants';

/**
 * The hero's decorative table: six cards flip on a loop, a hand of cards bobs below, and a toast
 * announces each person joining, one after another.
 */
@Component({
  selector: 'app-hero-stage',
  imports: [AvatarComponent, IconComponent, DelayDirective],
  templateUrl: './hero-stage.component.html',
  styleUrl: './hero-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class HeroStageComponent {
  protected readonly top = STAGE_TOP;
  protected readonly bottom = STAGE_BOTTOM;
  protected readonly fan = FAN;
  protected readonly joins = STAGE_JOINS;
  protected readonly checkIcon = IconName.Check;
}
