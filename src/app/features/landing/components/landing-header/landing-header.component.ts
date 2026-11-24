import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo/logo.component';

/** The landing page's sticky header: logo, section links and "Start a room". */
@Component({
  selector: 'app-landing-header',
  imports: [LogoComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent {}
