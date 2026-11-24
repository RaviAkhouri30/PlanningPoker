import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo/logo.component';

/** The landing page's footer. */
@Component({
  selector: 'app-landing-footer',
  imports: [LogoComponent],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {}
