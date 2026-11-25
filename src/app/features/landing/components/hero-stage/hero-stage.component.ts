import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { DelayDirective } from '@shared/directives/delay.directive';
import { FAN, STAGE_BOTTOM, STAGE_TOP } from '../../models/hero-stage.constants';
import { HeroFloatsComponent } from '../hero-floats/hero-floats.component';

/**
 * The hero's decorative table: six cards flip on a loop and a hand of cards bobs below, with
 * floating notes around it (`app-hero-floats`).
 */
@Component({
  selector: 'app-hero-stage',
  imports: [AvatarComponent, DelayDirective, HeroFloatsComponent],
  templateUrl: './hero-stage.component.html',
  styleUrl: './hero-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class HeroStageComponent {
  protected readonly top = STAGE_TOP;
  protected readonly bottom = STAGE_BOTTOM;
  protected readonly fan = FAN;
}
