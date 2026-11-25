import { Service, type Signal, inject, signal } from '@angular/core';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { ROOMS_STORAGE_KEY } from '@shared/constants/local-data.constants';
import { type ISavedRoom } from '@shared/interfaces/i-saved-room';
import { parseRooms, sortRooms } from '@shared/utils/local-data.util';

/**
 * The rooms this browser has been in, most recent first. The rooms themselves live in Firestore;
 * this browser only keeps the list, so clearing its data empties My rooms.
 */
@Service()
export class MyRoomsService {
  /** The saved rooms, most recently visited first. */
  public readonly rooms: Signal<readonly ISavedRoom[]>;

  private readonly preferences = inject(IPreferenceStore);
  private readonly saved = signal(parseRooms(this.preferences.read(ROOMS_STORAGE_KEY)));

  public constructor() {
    // Assigned here because it reads `saved`, a private field declared after the public one.
    this.rooms = this.saved.asReadonly();
  }

  /** Adds `room`, or refreshes it when it is already listed. */
  public remember(room: ISavedRoom): void {
    this.store([room, ...this.saved().filter((saved) => saved.id !== room.id)]);
  }

  /** Takes the room off the list; the room itself stays as it is. */
  public forget(roomId: string): void {
    this.store(this.saved().filter((saved) => saved.id !== roomId));
  }

  private store(rooms: readonly ISavedRoom[]): void {
    const sorted = sortRooms(rooms);
    this.saved.set(sorted);
    this.preferences.write(ROOMS_STORAGE_KEY, JSON.stringify(sorted));
  }
}
