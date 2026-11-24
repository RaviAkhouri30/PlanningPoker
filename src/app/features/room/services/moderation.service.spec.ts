import { TestBed } from '@angular/core/testing';
import { firstValueFrom, type Observable } from 'rxjs';
import { DeckType } from '@shared/enums/deck-type.enum';
import {
  TEST_NOW,
  roomFields,
  seed,
  stored,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { aRoom, aStory, storyFields } from '../testing/room-fixtures';
import { ModerationService, activationWrites } from './moderation.service';

describe('ModerationService', () => {
  let moderation: ModerationService;
  const room = aRoom({ round: 3 });

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
    await seed({
      'rooms/r1': roomFields({ round: 3, activeStoryId: 's1', roundStartedAt: 0 }),
      'rooms/r1/stories/s1': storyFields({ rounds: 1 }),
      'rooms/r1/stories/s2': storyFields({ order: 2 }),
    });
    moderation = TestBed.inject(ModerationService);
  });

  function run(write: Observable<void>): Promise<void> {
    return firstValueFrom(write, { defaultValue: undefined });
  }

  it('should reveal: mark the round, flip the room and count the round on the story', async () => {
    await run(moderation.reveal(room, aStory('s1', { rounds: 1 })));

    await expect(stored('rooms/r1/rounds/3')).resolves.toEqual({
      storyId: 's1',
      revealed: true,
      revealedAt: TEST_NOW,
    });
    await expect(stored('rooms/r1')).resolves.toMatchObject({ revealed: true });
    await expect(stored('rooms/r1/stories/s1')).resolves.toMatchObject({ rounds: 2 });
  });

  it('should start a new round to vote again', async () => {
    await run(moderation.voteAgain(room));

    await expect(stored('rooms/r1')).resolves.toMatchObject({
      round: 4,
      revealed: false,
      roundStartedAt: TEST_NOW,
    });
  });

  it('should accept an estimate and move to the next story', async () => {
    await run(moderation.settle(room, aStory('s1'), '5', aStory('s2')));

    await expect(stored('rooms/r1/stories/s1')).resolves.toMatchObject({
      status: 'done',
      estimate: '5',
    });
    await expect(stored('rooms/r1')).resolves.toMatchObject({ round: 4, activeStoryId: 's2' });
  });

  it('should skip a story and clear the active one when none is left', async () => {
    await run(moderation.settle(room, aStory('s1'), null, null));

    await expect(stored('rooms/r1/stories/s1')).resolves.toMatchObject({
      status: 'skipped',
      estimate: null,
    });
    await expect(stored('rooms/r1')).resolves.toMatchObject({ activeStoryId: null });
  });

  it('should select a story, reopening it', async () => {
    await run(moderation.select(room, aStory('s2')));

    await expect(stored('rooms/r1/stories/s2')).resolves.toMatchObject({ status: 'pending' });
    await expect(stored('rooms/r1')).resolves.toMatchObject({ activeStoryId: 's2', round: 4 });
  });

  it('should change the deck, auto-reveal, the join role and the timer', async () => {
    await run(moderation.setDeck(room, DeckType.TShirt));
    await run(moderation.setAutoReveal(room, false));
    await run(moderation.setSpectatorsByDefault(room, true));
    await run(moderation.resetTimer(room));

    await expect(stored('rooms/r1')).resolves.toMatchObject({
      deck: 'tshirt',
      round: 4,
      autoReveal: false,
      spectatorsByDefault: true,
      roundStartedAt: TEST_NOW,
    });
  });

  it('should make a new story the active one', () => {
    const [write] = activationWrites(room, 's9');

    expect(write?.path).toBe('rooms/r1');
    expect(write && 'fields' in write ? write.fields : null).toMatchObject({
      activeStoryId: 's9',
      round: 4,
    });
  });
});
