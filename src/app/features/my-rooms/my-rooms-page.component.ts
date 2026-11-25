import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { BrowserDataNoticeComponent } from '@shared/components/browser-data-notice/browser-data-notice.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { ForgetRoomDialogComponent } from './components/forget-room-dialog/forget-room-dialog.component';
import { SavedRoomListComponent } from './components/saved-room-list/saved-room-list.component';
import { type IMyRoomsState, MyRoomsViewModel } from './view-models/my-rooms.view-model';

/** My rooms: where a returning guest lands, to open a room they've been in or start a new one. */
@Component({
  selector: 'app-my-rooms-page',
  imports: [
    RouterLink,
    LogoComponent,
    ThemeToggleComponent,
    IconComponent,
    BrowserDataNoticeComponent,
    SavedRoomListComponent,
    ForgetRoomDialogComponent,
  ],
  templateUrl: './my-rooms-page.component.html',
  styleUrl: './my-rooms-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MyRoomsViewModel],
})
export default class MyRoomsPageComponent extends BaseComponent<IMyRoomsState> {
  protected override readonly model = inject(MyRoomsViewModel);
  protected readonly plusIcon = IconName.Plus;
  protected readonly downloadIcon = IconName.Download;
}
