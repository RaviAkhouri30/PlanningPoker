import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IRoomCard } from '../../models/i-room-card';

/** The rooms on My rooms: each with its code, your role, the last visit, Open and Forget. */
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

  /** Asked to take a room (by id) off the list. */
  public readonly forgetRoom = output<string>();

  protected readonly arrowIcon = IconName.ArrowRight;
}
