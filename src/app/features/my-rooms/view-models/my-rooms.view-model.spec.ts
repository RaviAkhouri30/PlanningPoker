import { TestBed } from '@angular/core/testing';
import { type Subscription, throwError } from 'rxjs';
import { type FakeFileSaver } from '@core/backends/fake/fake-file-saver';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { BACKUP_MESSAGES } from '@shared/constants/backup-messages.constants';
import { Animal } from '@shared/enums/animal.enum';
import { RoomRole } from '@shared/enums/room-role.enum';
import { LocalProfileService } from '@shared/services/local-profile.service';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { RoomBackupService } from '@shared/services/room-backup.service';
import { ToastService } from '@shared/services/toast.service';
import { roomFields, seed, testBackendProviders } from '@shared/testing/test-backend';
import { MY_ROOMS_MESSAGES } from '../models/my-rooms-messages.constants';
import { MyRoomsViewModel } from './my-rooms.view-model';

describe('MyRoomsViewModel', () => {
  const day = 24 * 60 * 60 * 1000;
  const now = 10 * day;

  function start(): MyRoomsViewModel {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        MyRoomsViewModel,
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return TestBed.inject(MyRoomsViewModel);
  }

  it('should show each saved room as a card when the browser has rooms', () => {
    const model = start();
    TestBed.inject(MyRoomsService).remember({
      id: 'r1',
      name: '',
      code: 'X7K2-92',
      role: RoomRole.Moderator,
      lastVisit: now - day,
    });

    expect(model.cards()).toEqual([
      {
        id: 'r1',
        name: MY_ROOMS_MESSAGES.untitled,
        code: 'X7K2-92',
        roleLabel: 'Moderator',
        visitLabel: 'Opened yesterday',
        open: ['/', 'r', 'r1'],
      },
    ]);
  });

  it('should greet the guest by first name when this browser knows it', () => {
    const model = start();
    expect(model.title()).toBe(MY_ROOMS_MESSAGES.title);

    TestBed.inject(LocalProfileService).save({ name: 'Maya Chen', avatar: Animal.Owl });

    expect(model.title()).toBe('Welcome back, Maya');
  });

  function rememberSprint(): void {
    TestBed.inject(MyRoomsService).remember({
      id: 'r1',
      name: 'Sprint',
      code: '',
      role: RoomRole.Player,
      lastVisit: now,
    });
  }

  it('should ask first and keep the room when Forget is pressed', () => {
    const model = start();
    rememberSprint();

    model.askToForget('r1');

    expect(model.forgetting()?.id).toBe('r1');
    expect(model.cards()).toHaveLength(1);
  });

  it('should drop the room and say so when the forget is confirmed', () => {
    const model = start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    rememberSprint();
    model.askToForget('r1');

    model.confirmForget();

    expect(model.cards()).toEqual([]);
    expect(model.forgetting()).toBeNull();
    expect(show).toHaveBeenCalledWith(MY_ROOMS_MESSAGES.forgotten, expect.anything());
  });

  it('should keep the room when the guest backs out of the forget', () => {
    const model = start();
    rememberSprint();
    model.askToForget('r1');

    model.keepRoom();

    expect(model.forgetting()).toBeNull();
    expect(model.cards()).toHaveLength(1);
  });

  it('should do nothing when a forget is confirmed with none asked', () => {
    const model = start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    rememberSprint();

    model.confirmForget();

    expect(model.cards()).toHaveLength(1);
    expect(show).not.toHaveBeenCalled();
  });

  describe('backups', () => {
    let subscription: Subscription | undefined;

    function remember(id: string): void {
      TestBed.inject(MyRoomsService).remember({
        id,
        name: id,
        code: '',
        role: RoomRole.Player,
        lastVisit: now,
      });
    }

    async function startWithRooms(): Promise<MyRoomsViewModel> {
      const model = start();
      vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
      await seed({ 'rooms/r1': roomFields(), 'rooms/r2': roomFields() });
      remember('r1');
      remember('r2');
      subscription = model.init().subscribe();
      return model;
    }

    afterEach(() => {
      subscription?.unsubscribe();
      vi.restoreAllMocks();
    });

    it('should save one room and name the file when a room is backed up', async () => {
      const model = await startWithRooms();
      const show = vi.spyOn(TestBed.inject(ToastService), 'show');

      model.backUp('r1');

      await vi.waitFor(() => {
        expect(show).toHaveBeenCalledWith(
          expect.stringContaining('planning-poker-r1-'),
          expect.anything(),
        );
      });
      expect(model.backingUp()).toBe(false);
    });

    it('should save every room in one file when all are backed up', async () => {
      const model = await startWithRooms();

      model.backUpAll();

      await vi.waitFor(() => {
        expect((TestBed.inject(IFileSaver) as FakeFileSaver).saved.at(0)?.name).toContain(
          'planning-poker-rooms-',
        );
      });
    });

    it('should say the backup failed when no room can be read', async () => {
      const model = await startWithRooms();
      const show = vi.spyOn(TestBed.inject(ToastService), 'show');
      vi.spyOn(TestBed.inject(RoomBackupService), 'download').mockReturnValue(
        throwError(() => new Error('denied')),
      );

      model.backUpAll();

      expect(show).toHaveBeenCalledWith(BACKUP_MESSAGES.failed, expect.anything());
      expect(model.backingUp()).toBe(false);
    });

    it('should count the rooms in words when there is one or several', () => {
      const model = start();
      remember('r1');
      expect(model.countLabel()).toBe(MY_ROOMS_MESSAGES.oneRoom);

      remember('r2');

      expect(model.countLabel()).toBe(MY_ROOMS_MESSAGES.manyRooms);
    });
  });
});
