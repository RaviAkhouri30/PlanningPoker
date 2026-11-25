import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LIMITS } from '@shared/constants/limits.constants';
import { IconName } from '@shared/enums/icon-name.enum';
import { StoryStatus } from '@shared/enums/story-status.enum';
import { type Story } from '@shared/models/story.model';
import { StoryTab } from '../../models/i-room-state';

/** How many stories each tab lists. */
export interface IStoryCounts {
  readonly active: number;
  readonly done: number;
  readonly all: number;
}

/** The story list with its tabs; the moderator can pick the next story and add new ones. */
@Component({
  selector: 'app-stories-panel',
  imports: [IconComponent],
  templateUrl: './stories-panel.component.html',
  styleUrl: './stories-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoriesPanelComponent {
  /** The stories the current tab lists. */
  public readonly stories = input.required<readonly Story[]>();
  public readonly counts = input.required<IStoryCounts>();
  public readonly tab = input.required<StoryTab>();
  public readonly activeId = input<string | null>(null);
  public readonly isModerator = input(false);

  public readonly tabPick = output<StoryTab>();
  public readonly storyPick = output<Story>();
  /** The text typed into "Add a story…". */
  public readonly add = output<string>();

  protected readonly tabs = [
    { tab: StoryTab.Active, label: 'Active', key: 'active' },
    { tab: StoryTab.Done, label: 'Completed', key: 'done' },
    { tab: StoryTab.All, label: 'All', key: 'all' },
  ] as const;
  protected readonly skipped = StoryStatus.Skipped;
  protected readonly maxTitle = LIMITS.storyTitle;
  protected readonly plusIcon = IconName.Plus;

  private readonly draft = viewChild<ElementRef<HTMLInputElement>>('draft');

  /**
   * Puts the cursor in "Add a story…". Focus scrolls the field into view, instantly, so it also
   * suits reduced motion; `scroll-margin` keeps it clear of the sticky header.
   */
  public focusDraft(): void {
    this.draft()?.nativeElement.focus();
  }

  /** Sends the draft and clears the field. */
  protected submit(event: Event, field: HTMLInputElement): void {
    event.preventDefault();
    if (field.value.trim() !== '') {
      this.add.emit(field.value);
      field.value = '';
    }
  }
}
