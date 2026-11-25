import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo/logo.component';
import {
  COPYRIGHT_HOLDER,
  COPYRIGHT_NOTICE,
  TERMS_UPDATED,
} from '@shared/constants/legal.constants';

/**
 * The terms of use: copyright, guest use without an account, where room data lives. A static
 * page with no state, so it has no view model to provide (decision log, AIDLC 0003).
 */
@Component({
  selector: 'app-terms-page',
  imports: [LogoComponent, ThemeToggleComponent],
  templateUrl: './terms-page.component.html',
  styleUrl: './terms-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TermsPageComponent {
  protected readonly holder = COPYRIGHT_HOLDER;
  protected readonly notice = COPYRIGHT_NOTICE;
  protected readonly updated = TERMS_UPDATED;
}
