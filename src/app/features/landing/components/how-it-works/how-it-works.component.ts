import { ChangeDetectionStrategy, Component } from '@angular/core';
import { STEPS } from '../../models/landing-content.constants';

/** "How it works": the three numbered steps. */
@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksComponent {
  protected readonly steps = STEPS;
}
