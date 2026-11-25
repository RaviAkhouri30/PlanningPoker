import { Injectable, computed, inject } from '@angular/core';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { BACKUP_MESSAGES } from '@shared/constants/backup-messages.constants';
import { roomCommands } from '@shared/constants/routes.constants';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ISavedRoom } from '@shared/interfaces/i-saved-room';
import { LocalProfileService } from '@shared/services/local-profile.service';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { type IBackupResult, RoomBackupService } from '@shared/services/room-backup.service';
import { ToastService } from '@shared/services/toast.service';
import { backupNotice } from '@shared/utils/backup-notice.util';
import { firstNameOf } from '@shared/utils/display.util';
import { timeAgo } from '@shared/utils/time-ago.util';
import { type IRoomCard } from '../models/i-room-card';
import { MY_ROOMS_MESSAGES, ROLE_LABELS } from '../models/my-rooms-messages.constants';

/** What My rooms needs besides the list. */
export interface IMyRoomsState {
  /** The moment "Opened …" is measured from. */
  readonly now: number;
  /** A backup is being made, so the backup buttons wait. */
  readonly backingUp: boolean;
}

/**
 * My rooms: the rooms this browser has been in, from `MyRoomsService`, as cards to open, back up
 * or forget. The list is local to the browser; only a backup reads the rooms themselves.
 */
@Injectable()
export class MyRoomsViewModel extends ViewModel<IMyRoomsState> {
  /** The rooms, most recently opened first. */
  public readonly cards = computed(() => {
    const now = this.data()?.now ?? 0;
    return this.myRooms.rooms().map((room) => MyRoomsViewModel.card(room, now));
  });

  /** "Welcome back, Maya" when this browser knows the name, else "My rooms". */
  public readonly title = computed(() => {
    const first = firstNameOf(this.profiles.profile()?.name ?? '');
    return first ? MY_ROOMS_MESSAGES.welcomePrefix + first : MY_ROOMS_MESSAGES.title;
  });

  /** "room" or "rooms", after the count above the list. */
  public readonly countLabel = computed(() =>
    this.cards().length === 1 ? MY_ROOMS_MESSAGES.oneRoom : MY_ROOMS_MESSAGES.manyRooms,
  );

  /** A backup is being made. */
  public readonly backingUp = computed(() => this.data()?.backingUp === true);

  // Read lazily by the computeds above, so declaring them after is safe.
  private readonly myRooms = inject(MyRoomsService);
  private readonly profiles = inject(LocalProfileService);
  private readonly toast = inject(ToastService);
  private readonly backup = inject(RoomBackupService);
  private readonly logger = inject(LoggerService);
  private readonly backups = new Subject<readonly string[]>();

  public constructor() {
    super();
    this.setData({ now: inject(CLOCK).now(), backingUp: false });
  }

  private static card(room: ISavedRoom, now: number): IRoomCard {
    return {
      id: room.id,
      name: room.name || MY_ROOMS_MESSAGES.untitled,
      code: room.code,
      roleLabel: ROLE_LABELS.get(room.role) ?? '',
      visitLabel: MY_ROOMS_MESSAGES.openedPrefix + timeAgo(room.lastVisit, now),
      open: roomCommands(room.id),
    };
  }

  /** Saves one room as a CSV file. */
  public backUp(roomId: string): void {
    this.backups.next([roomId]);
  }

  /** Saves every room on the list in one CSV file. */
  public backUpAll(): void {
    this.backups.next(this.myRooms.rooms().map((room) => room.id));
  }

  /** Takes the room off this browser's list. */
  public forget(roomId: string): void {
    this.myRooms.forget(roomId);
    this.toast.show(MY_ROOMS_MESSAGES.forgotten, ToastTone.Success);
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // exhaustMap: a second click while a file is being made is ignored, not queued.
    return this.backups.pipe(exhaustMap((roomIds) => this.download(roomIds)));
  }

  private download(roomIds: readonly string[]): Observable<IBackupResult> {
    this.setBusy(true);
    return this.backup.download(roomIds).pipe(
      tap((result) => {
        this.toast.show(backupNotice(result), ToastTone.Success);
      }),
      catchError((error: unknown) => {
        this.logger.error('Backing up rooms', error);
        this.toast.show(BACKUP_MESSAGES.failed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.setBusy(false);
      }),
    );
  }

  private setBusy(backingUp: boolean): void {
    this.updateData((current) => ({ now: current?.now ?? 0, backingUp }));
  }
}
