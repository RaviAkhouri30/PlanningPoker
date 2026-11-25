import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';

/**
 * The warning that a guest's identity lives in this browser: clearing its data, a private window
 * or another browser loses the room list and moderator rights (no account to restore them yet).
 */
@Component({
  selector: 'app-browser-data-notice',
  imports: [IconComponent],
  templateUrl: './browser-data-notice.component.html',
  styleUrl: './browser-data-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowserDataNoticeComponent {
  protected readonly alertIcon = IconName.Alert;
}
