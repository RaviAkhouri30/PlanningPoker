import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type Story } from '@shared/models/story.model';
import { StoryTab } from '../../models/i-room-state';
import { ROOM_MESSAGES } from '../../models/room-messages.constants';
import { StoryRowStatus } from '../../models/story-row-status.enum';
import { storyRows } from '../../models/story-row';

/** How many stories each tab lists. */
export interface IStoryCounts {
  readonly active: number;
  readonly done: number;
  readonly all: number;
}

/**
 * The room's stories as a table under the voting area: key, story and notes, status, estimate
 * and rounds, filtered by tab. The moderator adds stories here and picks the next one to vote on;
 * anyone can save the list as CSV. On phones each row becomes a card.
 */
@Component({
  selector: 'app-stories-table',
  imports: [IconComponent],
  templateUrl: './stories-table.component.html',
  styleUrl: './stories-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoriesTableComponent {
  /** The stories the current tab lists. */
  public readonly stories = input.required<readonly Story[]>();
  /** How many stories each tab lists. */
  public readonly counts = input.required<IStoryCounts>();
  /** The tab shown. */
  public readonly tab = input.required<StoryTab>();
  /** The story being voted on, if any. */
  public readonly activeId = input<string | null>(null);
  /** Whether this person moderates (adds and picks stories). */
  public readonly isModerator = input(false);

  /** Asked to show another tab. */
  public readonly tabPick = output<StoryTab>();
  /** Asked to vote on this story next. */
  public readonly storyPick = output<Story>();
  /** Asked to open the "Add a story" dialog. */
  public readonly addStory = output();
  /** Asked to save the room's stories as a CSV file. */
  public readonly downloadCsv = output();

  protected readonly rows = computed(() => storyRows(this.stories(), this.activeId()));
  protected readonly emptyText = computed(() => {
    if (this.counts().all > 0) {
      return ROOM_MESSAGES.noStoriesInTab;
    }
    return this.isModerator() ? ROOM_MESSAGES.noStoriesModerator : ROOM_MESSAGES.noStoriesPlayer;
  });
  protected readonly tabs = [
    { tab: StoryTab.Active, label: 'Active', key: 'active' },
    { tab: StoryTab.Done, label: 'Completed', key: 'done' },
    { tab: StoryTab.All, label: 'All', key: 'all' },
  ] as const;
  protected readonly voting = StoryRowStatus.Voting;
  protected readonly plusIcon = IconName.Plus;
  protected readonly downloadIcon = IconName.Download;
}
