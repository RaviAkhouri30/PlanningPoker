import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DECK_SAMPLE_SIZE, deckDefinition } from '@shared/constants/decks.constants';
import { DeckType } from '@shared/enums/deck-type.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type Room } from '@shared/models/room.model';

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

/** The moderator's card: timer, flip, clear, skip, the deck and auto-reveal. */
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

  public readonly resetTimer = output();
  public readonly reveal = output();
  public readonly voteAgain = output();
  public readonly skip = output();
  public readonly deckPick = output<DeckType>();
  public readonly autoRevealToggle = output();

  protected readonly decks = DECK_OPTIONS;
  protected readonly icons = IconName;
}
