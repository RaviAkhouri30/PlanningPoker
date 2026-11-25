import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DelayDirective } from '@shared/directives/delay.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { STAGE_JOINS } from '../../models/hero-stage.constants';

/**
 * The notes floating around the hero's demo table: a toast for each person joining, one after
 * another, and the "6 of 6 voted" badge. Demo data, on purpose (owner's call, AIDLC 0005).
 */
@Component({
  selector: 'app-hero-floats',
  imports: [AvatarComponent, IconComponent, DelayDirective],
  templateUrl: './hero-floats.component.html',
  styleUrl: './hero-floats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFloatsComponent {
  protected readonly joins = STAGE_JOINS;
  protected readonly checkIcon = IconName.Check;
}
