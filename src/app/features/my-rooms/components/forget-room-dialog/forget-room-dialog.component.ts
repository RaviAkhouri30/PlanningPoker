import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalDirective } from '@shared/directives/modal.directive';
import { type IRoomCard } from '../../models/i-room-card';

/**
 * Asks before a room comes off My rooms. Guests have no account, so this browser's list is the
 * only place the room is remembered: once forgotten, getting back in needs its link or code.
 */
@Component({
  selector: 'app-forget-room-dialog',
  imports: [ModalDirective],
  templateUrl: './forget-room-dialog.component.html',
  styleUrl: './forget-room-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgetRoomDialogComponent {
  /** The room about to be forgotten; the dialog shows while there is one. */
  public readonly room = input<IRoomCard | null>(null);

  /** Forget it after all. */
  public readonly confirmForget = output();
  /** Keep it (Cancel, Escape or the backdrop's close). */
  public readonly closed = output();
}
