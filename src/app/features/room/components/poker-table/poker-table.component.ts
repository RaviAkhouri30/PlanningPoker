import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type VotingStats } from '@shared/models/voting-stats.model';
import { type ISeatView } from '../../models/i-seat-view';
import { ROOM_MESSAGES } from '../../models/room-messages.constants';
import { ResultsPanelComponent } from '../results-panel/results-panel.component';
import { TableSeatComponent } from '../table-seat/table-seat.component';

/**
 * The room's stage: the players in a row, then the deck (projected by the page while the round
 * is open) with the vote count under it, or the results once the cards are flipped.
 */
@Component({
  selector: 'app-poker-table',
  imports: [IconComponent, TableSeatComponent, ResultsPanelComponent],
  templateUrl: './poker-table.component.html',
  styleUrl: './poker-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokerTableComponent {
  /** The players. */
  public readonly seats = input.required<readonly ISeatView[]>();
  public readonly hasStory = input(false);
  /** Stories settled so far; with no story left, the table says the work is done. */
  public readonly settledCount = input(0);
  public readonly revealed = input(false);
  public readonly autoReveal = input(true);
  public readonly isModerator = input(false);
  public readonly votedCount = input(0);
  /** Results once revealed. */
  public readonly stats = input<VotingStats | null>(null);

  public readonly reveal = output();
  public readonly accept = output<string>();
  public readonly voteAgain = output();
  /** The moderator asked to add a story from the empty table. */
  public readonly addStory = output();

  /** Players with no card once the cards are flipped: the grey part of the chart. */
  protected readonly noVoteCount = computed(
    () => this.seats().filter((seat) => seat.card === null).length,
  );
  protected readonly waitLabel = computed(() =>
    this.seats().length > 0 && this.votedCount() === this.seats().length
      ? ROOM_MESSAGES.everyone
      : ROOM_MESSAGES.waiting,
  );
  protected readonly hint = computed(() => {
    if (this.autoReveal()) {
      return ROOM_MESSAGES.autoOn;
    }
    return this.isModerator() ? ROOM_MESSAGES.autoOff : ROOM_MESSAGES.waitingModerator;
  });
  protected readonly addLabel = computed(() =>
    this.settledCount() > 0 ? ROOM_MESSAGES.addAnotherStory : ROOM_MESSAGES.addFirstStory,
  );
  protected readonly eyeIcon = IconName.Eye;
  protected readonly cardsIcon = IconName.Cards;
  protected readonly plusIcon = IconName.Plus;
}
