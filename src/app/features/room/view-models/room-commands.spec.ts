import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { type Subscription, firstValueFrom, throwError } from 'rxjs';
import { FAKE_GUEST_UID } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { type FakeFileSaver } from '@core/backends/fake/fake-file-saver';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { BACKUP_MESSAGES } from '@shared/constants/backup-messages.constants';
import { DeckType } from '@shared/enums/deck-type.enum';
import { RoomBackupService } from '@shared/services/room-backup.service';
import { ToastService } from '@shared/services/toast.service';
import {
  participantFields,
  roomFields,
  seed,
  stored,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { StoryTab } from '../models/i-room-state';
import { ROOM_MESSAGES } from '../models/room-messages.constants';
import { storyFields } from '../testing/room-fixtures';
import { RoomViewModel } from './room.view-model';

const ME = FAKE_GUEST_UID;

describe('RoomCommands', () => {
  let subscription: Subscription | undefined;
  let model: RoomViewModel;

  async function start(
    room = roomFields({ moderatorUid: ME, activeStoryId: 's1' }),
  ): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://planningpoker.test' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ roomId: 'r1' }) } },
        },
        RoomViewModel,
      ],
    });
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Alex Kim'));
    await seed({
      'rooms/r1': room,
      [`rooms/r1/participants/${ME}`]: participantFields({ displayName: 'Alex Kim' }),
      'rooms/r1/stories/s1': storyFields(),
      'rooms/r1/stories/s2': storyFields({ key: 'PAY-215', order: 2 }),
    });
    model = TestBed.inject(RoomViewModel);
    subscription = model.init().subscribe();
  }

  afterEach(() => {
    subscription?.unsubscribe();
    vi.restoreAllMocks();
  });

  it('should play, change and take back a card', async () => {
    await start();

    model.commands.pick('5');
    model.commands.pick('8');
    expect(model.view().myCard).toBe('8');
    model.commands.pick('8');
    expect(model.view().myCard).toBeNull();
    model.commands.pick('not-a-card');
    expect(model.view().myCard).toBeNull();
  });

  it('should accept an estimate and move on to the next story', async () => {
    await start();
    model.commands.pick('5');
    model.commands.reveal();

    model.commands.accept('5');

    await expect(stored('rooms/r1/stories/s1')).resolves.toMatchObject({
      status: 'done',
      estimate: '5',
    });
    expect(model.view().room).toMatchObject({ activeStoryId: 's2', round: 2, revealed: false });
    expect(model.view().myCard).toBeNull();
  });

  it('should skip, select, vote again and reset the timer', async () => {
    await start();

    model.commands.skip();
    await expect(stored('rooms/r1/stories/s1')).resolves.toMatchObject({ status: 'skipped' });
    model.commands.select(model.view().stories[0]!);
    model.commands.select(model.view().stories[0]!);
    model.commands.voteAgain();
    model.commands.resetTimer();

    expect(model.view().room).toMatchObject({ activeStoryId: 's1', round: 4 });
  });

  it('should change the deck, auto-reveal and the join role', async () => {
    await start();

    model.commands.setDeck(DeckType.TShirt);
    model.commands.setDeck(DeckType.TShirt);
    model.commands.toggleAutoReveal();
    model.commands.toggleSpectatorsByDefault();

    expect(model.view().room).toMatchObject({
      deckType: DeckType.TShirt,
      round: 2,
      autoReveal: false,
      spectatorsByDefault: true,
    });
  });

  it('should add stories, making the first one active', async () => {
    await start(roomFields({ moderatorUid: ME, activeStoryId: null }));

    model.commands.addStory({ text: '   ', description: '' });
    model.commands.addStory({ text: 'PAY-300 Refunds', description: ' Card refunds only ' });

    expect(model.activeStory()).toMatchObject({
      key: 'PAY-300',
      title: 'Refunds',
      description: 'Card refunds only',
      order: 3,
    });
  });

  it('should ignore moderator commands from anyone else', async () => {
    await start(roomFields({ moderatorUid: 'someone-else', activeStoryId: 's1' }));

    model.commands.reveal();
    model.commands.skip();

    expect(model.view().room).toMatchObject({ revealed: false, round: 1 });
  });

  it('should keep the dialog and tab choices', async () => {
    await start();

    model.commands.setInviteOpen(true);
    model.commands.setAddStoryOpen(true);
    model.commands.showTab(StoryTab.Done);

    expect(model.view()).toMatchObject({
      inviteOpen: true,
      addStoryOpen: true,
      storyTab: StoryTab.Done,
    });
  });

  it('should copy the link and say whether it worked', async () => {
    await start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    const copy = vi.spyOn(TestBed.inject(IClipboardService), 'copy');

    model.commands.copyLink();
    copy.mockReturnValueOnce(throwError(() => new Error('denied')));
    model.commands.copyLink();

    expect(copy).toHaveBeenCalledWith('https://planningpoker.test/r/r1');
    expect(show).toHaveBeenCalledWith(ROOM_MESSAGES.linkCopied, expect.anything());
    expect(show).toHaveBeenCalledWith(ROOM_MESSAGES.copyFailed, expect.anything());
  });

  it('should let the moderator stop voting to facilitate, and start again', async () => {
    await start();

    model.commands.toggleVoting();
    await expect(stored(`rooms/r1/participants/${ME}`)).resolves.toMatchObject({
      role: 'spectator',
    });
    expect(model.isVoting()).toBe(false);
    model.commands.toggleVoting();

    await expect(stored(`rooms/r1/participants/${ME}`)).resolves.toMatchObject({
      role: 'player',
    });
  });

  it('should save the room as a CSV file and name it when Download CSV is pressed', async () => {
    await start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');

    model.commands.downloadCsv();

    await vi.waitFor(() => {
      expect((TestBed.inject(IFileSaver) as FakeFileSaver).saved).toHaveLength(1);
    });
    expect(show).toHaveBeenCalledWith(
      expect.stringContaining('planning-poker-r1-'),
      expect.anything(),
    );
  });

  it('should say the backup failed when the room cannot be read', async () => {
    await start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    vi.spyOn(TestBed.inject(RoomBackupService), 'download').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    model.commands.downloadCsv();

    await vi.waitFor(() => {
      expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.failed, expect.anything());
    });
    expect(show).not.toHaveBeenCalledWith(ROOM_MESSAGES.actionFailed, expect.anything());
  });
});
