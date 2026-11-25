import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { TimerPhase } from '../../models/timer-phase.enum';
import { TourTarget } from '../../models/tour-target.enum';

/**
 * The room's sticky bar: name, who's online, the code, the round timer, "Add story", "Invite" and
 * the tour button.
 */
@Component({
  selector: 'app-room-header',
  imports: [LogoComponent, IconComponent, AvatarComponent, ThemeToggleComponent],
  templateUrl: './room-header.component.html',
  styleUrl: './room-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomHeaderComponent {
  public readonly room = input.required<Room>();
  /** The signed-in person's seat, or `null`. */
  public readonly me = input<Participant | null>(null);
  public readonly onlineCount = input(0);
  /** `mm:ss` left on the round countdown. */
  public readonly timer = input('00:00');
  /** Where the countdown stands, for its colour. */
  public readonly timerPhase = input(TimerPhase.Idle);
  /** Whether to show "Add story": only the moderator adds stories. */
  public readonly canAddStory = input(false);

  /** Asked to open the invite dialog. */
  public readonly invite = output();
  /** Asked to go to the story field. */
  public readonly addStory = output();
  /** Asked to replay the guided tour. */
  public readonly tourStart = output();

  protected readonly clockIcon = IconName.Clock;
  protected readonly linkIcon = IconName.Link;
  protected readonly plusIcon = IconName.Plus;
  protected readonly helpIcon = IconName.Help;
  protected readonly targets = TourTarget;
}
