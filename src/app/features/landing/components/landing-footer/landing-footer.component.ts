import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo/logo.component';

/**
 * The landing page's closing links. Not a `<footer>`: the app-wide copyright footer is the page's
 * one contentinfo landmark.
 */
@Component({
  selector: 'app-landing-footer',
  imports: [LogoComponent],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {}
