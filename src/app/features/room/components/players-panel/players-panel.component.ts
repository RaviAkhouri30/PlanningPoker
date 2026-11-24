import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type ISeatView, SeatSlot } from '../../models/i-seat-view';

/** Everyone in the room, with their role and whether they've voted. */
@Component({
  selector: 'app-players-panel',
  imports: [AvatarComponent, IconComponent],
  templateUrl: './players-panel.component.html',
  styleUrl: './players-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersPanelComponent {
  /** Everyone, players first. */
  public readonly seats = input.required<readonly ISeatView[]>();
  public readonly votedCount = input(0);
  public readonly playerCount = input(0);

  protected readonly card = SeatSlot.Card;
  protected readonly checkIcon = IconName.Check;
}
