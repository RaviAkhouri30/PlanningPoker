import { aStory } from '../testing/room-fixtures';
import { StoryRowStatus } from './story-row-status.enum';
import { storyRows } from './story-row';

describe('storyRows', () => {
  it('should mark each story by where it stands when given the active one', () => {
    const rows = storyRows(
      [
        aStory('s1'),
        aStory('s2'),
        aStory('s3', { status: 'done', estimate: '5' }),
        aStory('s4', { status: 'skipped' }),
      ],
      's1',
    );

    expect(rows.map((row) => [row.status, row.statusLabel, row.pickLabel])).toEqual([
      [StoryRowStatus.Voting, 'Voting', null],
      [StoryRowStatus.Open, 'To estimate', 'Vote'],
      [StoryRowStatus.Estimated, 'Estimated', 'Re-estimate'],
      [StoryRowStatus.Skipped, 'Skipped', 'Re-estimate'],
    ]);
  });

  it('should leave every pending story open when nothing is being voted on', () => {
    expect(storyRows([aStory('s1')], null).at(0)?.status).toBe(StoryRowStatus.Open);
  });
});
