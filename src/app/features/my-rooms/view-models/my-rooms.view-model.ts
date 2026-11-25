import { Injectable, computed, inject } from '@angular/core';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { roomCommands } from '@shared/constants/routes.constants';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ISavedRoom } from '@shared/interfaces/i-saved-room';
import { LocalProfileService } from '@shared/services/local-profile.service';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { ToastService } from '@shared/services/toast.service';
import { firstNameOf } from '@shared/utils/display.util';
import { timeAgo } from '@shared/utils/time-ago.util';
import { type IRoomCard } from '../models/i-room-card';
import { MY_ROOMS_MESSAGES, ROLE_LABELS } from '../models/my-rooms-messages.constants';

/** What My rooms needs besides the list: the moment "Opened …" is measured from. */
export interface IMyRoomsState {
  readonly now: number;
}

/**
 * My rooms: the rooms this browser has been in, from `MyRoomsService`, as cards to open or
 * forget. Everything is local to the browser, so there is nothing to load or wait for.
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

  // Read lazily by the computeds above, so declaring them after is safe.
  private readonly myRooms = inject(MyRoomsService);
  private readonly profiles = inject(LocalProfileService);
  private readonly toast = inject(ToastService);

  public constructor() {
    super();
    this.setData({ now: inject(CLOCK).now() });
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

  /** Takes the room off this browser's list. */
  public forget(roomId: string): void {
    this.myRooms.forget(roomId);
    this.toast.show(MY_ROOMS_MESSAGES.forgotten, ToastTone.Success);
  }
}
