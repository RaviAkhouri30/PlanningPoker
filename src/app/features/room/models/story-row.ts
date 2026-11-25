import { StoryStatus } from '@shared/enums/story-status.enum';
import { type Story } from '@shared/models/story.model';
import { StoryRowStatus } from './story-row-status.enum';

/** One row of the stories table, ready to show. */
export interface IStoryRow {
  readonly story: Story;
  readonly status: StoryRowStatus;
  /** e.g. "To estimate". */
  readonly statusLabel: string;
  /** The moderator's button: "Vote" or "Re-estimate", or `null` for the story being voted on. */
  readonly pickLabel: string | null;
}

/** How each status reads in the table. */
export const STORY_ROW_LABELS: ReadonlyMap<StoryRowStatus, string> = new Map([
  [StoryRowStatus.Voting, 'Voting'],
  [StoryRowStatus.Open, 'To estimate'],
  [StoryRowStatus.Estimated, 'Estimated'],
  [StoryRowStatus.Skipped, 'Skipped'],
]);

const PICK_LABEL = 'Vote';
const REPICK_LABEL = 'Re-estimate';

function statusOf(story: Story, activeId: string | null): StoryRowStatus {
  if (story.id === activeId) {
    return StoryRowStatus.Voting;
  }
  if (story.status === StoryStatus.Skipped) {
    return StoryRowStatus.Skipped;
  }
  return story.isPending ? StoryRowStatus.Open : StoryRowStatus.Estimated;
}

/**
 * @param stories The stories the current tab lists.
 * @param activeId The story being voted on, if any.
 * @returns A row per story with its status and the moderator's action.
 */
export function storyRows(stories: readonly Story[], activeId: string | null): IStoryRow[] {
  return stories.map((story) => {
    const status = statusOf(story, activeId);
    const pickLabel = status === StoryRowStatus.Open ? PICK_LABEL : REPICK_LABEL;
    return {
      story,
      status,
      statusLabel: STORY_ROW_LABELS.get(status) ?? '',
      pickLabel: status === StoryRowStatus.Voting ? null : pickLabel,
    };
  });
}
