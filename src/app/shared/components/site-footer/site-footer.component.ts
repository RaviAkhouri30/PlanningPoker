import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COPYRIGHT_NOTICE } from '@shared/constants/legal.constants';
import { TERMS_COMMANDS } from '@shared/constants/routes.constants';

/** The copyright line and the link to the terms, at the foot of every page. */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  protected readonly notice = COPYRIGHT_NOTICE;
  protected readonly termsLink = TERMS_COMMANDS;
}
