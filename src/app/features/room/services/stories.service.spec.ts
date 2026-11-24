import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { seed, stored, testBackendProviders } from '@shared/testing/test-backend';
import { storyFields } from '../testing/room-fixtures';
import { StoriesService } from './stories.service';

describe('StoriesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
  });

  it('should watch the stories in list order', async () => {
    await seed({
      'rooms/r1/stories/b': storyFields({ order: 2, title: 'Second' }),
      'rooms/r1/stories/a': storyFields({ order: 1, title: 'First' }),
    });

    const stories = await firstValueFrom(TestBed.inject(StoriesService).watchAll('r1'));

    expect(stories.map((story) => story.title)).toEqual(['First', 'Second']);
  });

  it('should add a pending story with the extra writes in one commit', async () => {
    await seed({ 'rooms/r1': { round: 1 } });

    const id = await firstValueFrom(
      TestBed.inject(StoriesService).add(
        'r1',
        { key: 'PAY-214', title: 'Save cards' },
        4,
        (storyId) => [
          { kind: StoreWriteKind.Update, path: 'rooms/r1', fields: { activeStoryId: storyId } },
        ],
      ),
    );

    expect(id).toBe('aaaaaaaaaa');
    await expect(stored(`rooms/r1/stories/${id}`)).resolves.toMatchObject({
      key: 'PAY-214',
      title: 'Save cards',
      order: 4,
      status: 'pending',
      rounds: 0,
    });
    await expect(stored('rooms/r1')).resolves.toMatchObject({ activeStoryId: id });
  });
});
