import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo/logo.component';

/** The landing page's sticky header: logo, section links and "Start a room". */
@Component({
  selector: 'app-landing-header',
  imports: [LogoComponent, ThemeToggleComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent {}
