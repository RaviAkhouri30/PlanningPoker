import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FULL_PERCENT } from '@shared/constants/voting.constants';
import { WidthPercentDirective } from '@shared/directives/width-percent.directive';
import { type Story } from '@shared/models/story.model';

/** "Now estimating": the current story and the session's progress. */
@Component({
  selector: 'app-story-header',
  imports: [WidthPercentDirective],
  templateUrl: './story-header.component.html',
  styleUrl: './story-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryHeaderComponent {
  public readonly story = input.required<Story>();
  /** Every story, in list order. */
  public readonly stories = input.required<readonly Story[]>();
  /** The deck's name. */
  public readonly deckLabel = input.required<string>();

  protected readonly position = computed(() => this.stories().indexOf(this.story()) + 1);
  protected readonly settled = computed(
    () => this.stories().filter((story) => !story.isPending).length,
  );
  protected readonly percent = computed(() =>
    this.stories().length === 0
      ? 0
      : Math.round((this.settled() / this.stories().length) * FULL_PERCENT),
  );
}
