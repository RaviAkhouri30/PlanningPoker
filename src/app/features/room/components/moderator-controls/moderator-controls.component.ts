import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DECK_SAMPLE_SIZE, deckDefinition } from '@shared/constants/decks.constants';
import { MS_PER_SECOND, TIMER_LIMITS } from '@shared/constants/timer.constants';
import { DeckType } from '@shared/enums/deck-type.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type Room } from '@shared/models/room.model';
import { formatClock } from '@shared/utils/display.util';

/** One deck the moderator can pick. */
interface IDeckOption {
  readonly type: DeckType;
  readonly label: string;
  /** The first few cards, e.g. "0 ½ 1 2 3 5 8". */
  readonly sample: string;
}

const DECK_OPTIONS: readonly IDeckOption[] = Object.values(DeckType).map((type) => ({
  type,
  label: deckDefinition(type).label,
  sample: deckDefinition(type).cards.slice(0, DECK_SAMPLE_SIZE).join(' '),
}));

const STEP = TIMER_LIMITS.stepSeconds;

/**
 * The moderator's card: reset the countdown, flip, clear, skip, the countdown's length and its
 * lock at zero, the deck, auto-reveal and whether the moderator votes.
 */
@Component({
  selector: 'app-moderator-controls',
  imports: [IconComponent],
  templateUrl: './moderator-controls.component.html',
  styleUrl: './moderator-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeratorControlsComponent {
  public readonly room = input.required<Room>();
  public readonly hasStory = input(false);
  public readonly votedCount = input(0);
  /** Whether the moderator votes too; off means they only facilitate. */
  public readonly voting = input(true);
  /** Whether time ran out and voting is locked: "Reset timer" stands out. */
  public readonly timeUp = input(false);

  public readonly resetTimer = output();
  public readonly reveal = output();
  public readonly voteAgain = output();
  public readonly skip = output();
  public readonly deckPick = output<DeckType>();
  public readonly autoRevealToggle = output();
  /** Vote too, or only facilitate. */
  public readonly votingToggle = output();
  /** Asked for a countdown of this many seconds. */
  public readonly timerChange = output<number>();
  /** Asked to turn the lock at zero on or off. */
  public readonly lockToggle = output();

  protected readonly duration = computed(() =>
    formatClock(this.room().timerSeconds * MS_PER_SECOND),
  );
  protected readonly shorter = computed(() => this.room().timerSeconds - STEP);
  protected readonly longer = computed(() => this.room().timerSeconds + STEP);
  protected readonly limits = TIMER_LIMITS;
  protected readonly shorterLabel = `${String(STEP)} seconds shorter`;
  protected readonly longerLabel = `${String(STEP)} seconds longer`;
  protected readonly decks = DECK_OPTIONS;
  protected readonly icons = IconName;
}
