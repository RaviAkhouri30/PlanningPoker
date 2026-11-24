import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';

/** The room's sticky bar: name, who's online, the code, the round timer and "Invite". */
@Component({
  selector: 'app-room-header',
  imports: [LogoComponent, IconComponent, AvatarComponent],
  templateUrl: './room-header.component.html',
  styleUrl: './room-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomHeaderComponent {
  public readonly room = input.required<Room>();
  /** The signed-in person's seat, or `null`. */
  public readonly me = input<Participant | null>(null);
  public readonly onlineCount = input(0);
  /** `mm:ss` since the round started. */
  public readonly timer = input('00:00');

  /** Asked to open the invite dialog. */
  public readonly invite = output();

  protected readonly clockIcon = IconName.Clock;
  protected readonly linkIcon = IconName.Link;
}
