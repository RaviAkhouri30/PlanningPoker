import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { QUESTIONS } from '../../models/landing-content.constants';

/** "Questions": native disclosure widgets, the first one open. */
@Component({
  selector: 'app-faq-list',
  imports: [IconComponent],
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  protected readonly questions = QUESTIONS;
  protected readonly plusIcon = IconName.Plus;
}
