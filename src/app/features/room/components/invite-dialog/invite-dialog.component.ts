import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalDirective } from '@shared/directives/modal.directive';
import { IconName } from '@shared/enums/icon-name.enum';

/** "Invite your team": the link to copy, the code, and the join-as-spectator default. */
@Component({
  selector: 'app-invite-dialog',
  imports: [IconComponent, ModalDirective],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteDialogComponent {
  public readonly open = input(false);
  /** The link without its scheme. */
  public readonly link = input.required<string>();
  public readonly code = input.required<string>();
  public readonly spectatorsByDefault = input(false);
  /** Whether the spectator switch shows (moderators only). */
  public readonly canConfigure = input(false);

  public readonly closed = output();
  public readonly copyLink = output();
  public readonly spectatorsToggle = output();

  protected readonly copyIcon = IconName.Copy;
  protected readonly closeIcon = IconName.Close;
}
