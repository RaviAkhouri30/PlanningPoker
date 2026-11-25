import { inject } from '@angular/core';
import { CLOCK } from '@core/tokens/clock.token';
import { JOIN_NOTICE_WINDOW_MS } from '@shared/constants/room.constants';
import { type Participant } from '@shared/models/participant.model';
import { ToastService } from '@shared/services/toast.service';
import { firstNameOf } from '@shared/utils/display.util';
import { ROOM_MESSAGES } from '../models/room-messages.constants';

/**
 * Announces real people as they take a seat ("Priya joined the room"). The first list it sees is
 * everyone already there, so opening a room announces nobody. Built in the view model's injection
 * context.
 */
export class JoinNotices {
  private readonly clock = inject(CLOCK);
  private readonly toast = inject(ToastService);
  private known: ReadonlySet<string> | null = null;

  /**
   * Compares the room's people with the last list and announces the new ones.
   * @param people Everyone in the room now.
   * @param myUid The person on this page, who is never announced to themself.
   */
  public see(people: readonly Participant[], myUid: string | null): void {
    const known = this.known;
    this.known = new Set(people.map((person) => person.uid));
    if (known === null) {
      return;
    }
    const names = people
      .filter((person) => !known.has(person.uid) && person.uid !== myUid && this.isRecent(person))
      .map((person) => firstNameOf(person.displayName))
      .filter((name) => name !== '');
    if (names.length > 0) {
      // The toast shows one message at a time, so people who arrive together share one.
      this.toast.show(names.join(ROOM_MESSAGES.nameSeparator) + ROOM_MESSAGES.joinedSuffix);
    }
  }

  /** A seat still waiting for its server time was taken just now. */
  private isRecent(person: Participant): boolean {
    return person.joinedAt === null || this.clock.now() - person.joinedAt <= JOIN_NOTICE_WINDOW_MS;
  }
}
