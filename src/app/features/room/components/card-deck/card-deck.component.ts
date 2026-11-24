import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { BREAK_CARD } from '@shared/constants/cards.constants';
import { IconName } from '@shared/enums/icon-name.enum';

/** The hand under the table: one button per card, the played one lifted. */
@Component({
  selector: 'app-card-deck',
  imports: [IconComponent],
  templateUrl: './card-deck.component.html',
  styleUrl: './card-deck.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDeckComponent {
  /** The deck's cards, in order. */
  public readonly cards = input.required<readonly string[]>();
  /** The card played this round, or `null`. */
  public readonly picked = input<string | null>(null);
  /** Whether cards can be played now. */
  public readonly enabled = input(false);
  /** The line above the cards. */
  public readonly prompt = input('');

  /** A card was played (or played again, to take it back). */
  public readonly pick = output<string>();

  protected readonly breakCard = BREAK_CARD;
  protected readonly coffeeIcon = IconName.Coffee;
}
