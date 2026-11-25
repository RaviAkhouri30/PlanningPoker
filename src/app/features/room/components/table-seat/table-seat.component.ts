import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { BREAK_CARD } from '@shared/constants/cards.constants';
import { DelayDirective } from '@shared/directives/delay.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { type ISeatView, SeatSlot } from '../../models/i-seat-view';

/** One player on the stage: their card (face down until the flip, then coloured) and name. */
@Component({
  selector: 'app-table-seat',
  imports: [AvatarComponent, IconComponent, DelayDirective],
  templateUrl: './table-seat.component.html',
  styleUrl: './table-seat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The card's colour band, read by the styles once the cards are flipped.
  host: { '[attr.data-band]': 'seat().band' },
})
export class TableSeatComponent {
  public readonly seat = input.required<ISeatView>();
  /** Whether the cards are face up. */
  public readonly revealed = input(false);

  protected readonly slots = SeatSlot;
  protected readonly breakCard = BREAK_CARD;
  protected readonly coffeeIcon = IconName.Coffee;
}
