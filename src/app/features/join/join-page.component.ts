import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { GuestJoinFormComponent } from './components/guest-join-form/guest-join-form.component';
import { RoomPreviewComponent } from './components/room-preview/room-preview.component';
import { type IJoinState, JoinStatus } from './models/i-join-state';
import { JoinViewModel } from './view-models/join.view-model';

/** The page behind a room's link for anyone not yet in the room. */
@Component({
  selector: 'app-join-page',
  imports: [RouterLink, LogoComponent, RoomPreviewComponent, GuestJoinFormComponent],
  templateUrl: './join-page.component.html',
  styleUrl: './join-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JoinViewModel],
})
export default class JoinPageComponent extends BaseComponent<IJoinState> {
  protected override readonly model = inject(JoinViewModel);
  protected readonly statuses = JoinStatus;
}
