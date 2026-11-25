import { Service, inject } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { IRealtimeStore, SERVER_TIME, type StoreWrite } from '@core/interfaces/i-realtime-store';
import { RANDOM } from '@core/tokens/random.token';
import { LIMITS } from '@shared/constants/limits.constants';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { StoryStatus } from '@shared/enums/story-status.enum';
import { Story } from '@shared/models/story.model';
import { randomCharacters } from '@shared/utils/room-id.util';
import { type IStoryDraft } from '../models/story-draft.util';

/** Characters in a story id: enough that two moderators' tabs never collide. */
const STORY_ID_LENGTH = 10;

/** The stories of a room (`rooms/{roomId}/stories/{storyId}`), written by its moderator. */
@Service()
export class StoriesService {
  private readonly store = inject(IRealtimeStore);
  private readonly random = inject(RANDOM);

  /** @returns The room's stories in list order, after every change. */
  public watchAll(roomId: string): Observable<readonly Story[]> {
    return this.store
      .watchCollection(STORE_PATHS.stories(roomId), 'order')
      .pipe(map((documents) => documents.map((item) => new Story(item.id, item.fields))));
  }

  /**
   * Adds a story at the end of the list.
   * @param extra Writes committed with it in one batch, e.g. making it the active story.
   * @returns The new story's id, once stored.
   */
  public add(
    roomId: string,
    draft: IStoryDraft,
    order: number,
    extra: (id: string) => StoreWrite[],
  ): Observable<string> {
    // defer: a fresh id per subscription, so a retry never reuses one.
    return defer(() => {
      const id = randomCharacters(STORY_ID_LENGTH, this.random).toLowerCase();
      const story: StoreWrite = {
        kind: StoreWriteKind.Set,
        path: STORE_PATHS.story(roomId, id),
        fields: {
          key: draft.key.slice(0, LIMITS.storyKey),
          title: draft.title.slice(0, LIMITS.storyTitle),
          description: draft.description.slice(0, LIMITS.storyDescription),
          order,
          status: StoryStatus.Pending,
          estimate: null,
          rounds: 0,
          createdAt: SERVER_TIME,
        },
      };
      return this.store.commit([story, ...extra(id)]).pipe(map(() => id));
    });
  }
}
