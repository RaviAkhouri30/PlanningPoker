import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IRoomCard } from '../../models/i-room-card';

/** The rooms on My rooms: each with its code, your role, the last visit, Open, Back up, Forget. */
@Component({
  selector: 'app-saved-room-list',
  imports: [RouterLink, IconComponent],
  templateUrl: './saved-room-list.component.html',
  styleUrl: './saved-room-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedRoomListComponent {
  /** The rooms, most recent first. */
  public readonly rooms = input.required<readonly IRoomCard[]>();

  /** A backup is being made, so Back up waits. */
  public readonly busy = input(false);

  /** Asked to take a room (by id) off the list; the page confirms first. */
  public readonly forgetRoom = output<string>();

  /** Asked to save a room (by id) as a CSV file. */
  public readonly backupRoom = output<string>();

  protected readonly arrowIcon = IconName.ArrowRight;
  protected readonly downloadIcon = IconName.Download;
}
