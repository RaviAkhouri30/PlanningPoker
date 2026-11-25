import { type StoreFields } from '@core/interfaces/i-realtime-store';
import { Participant } from '@shared/models/participant.model';
import { Room } from '@shared/models/room.model';
import { Story } from '@shared/models/story.model';
import { TEST_NOW, participantFields, roomFields } from '@shared/testing/test-backend';
import { type IRoomState, LOADING_ROOM, RoomStatus } from '../models/i-room-state';

/** A story document, with overrides. */
export function storyFields(change: StoreFields = {}): StoreFields {
  return {
    key: 'PAY-214',
    title: 'Save cards',
    description: '',
    order: 1,
    status: 'pending',
    estimate: null,
    rounds: 0,
    createdAt: TEST_NOW,
    ...change,
  };
}

/** A room model with overrides (id `r1`, moderated by `mod`). */
export function aRoom(change: StoreFields = {}): Room {
  return new Room('r1', roomFields({ activeStoryId: 's1', ...change }));
}

/** A participant model with overrides. */
export function aPerson(uid: string, change: StoreFields = {}): Participant {
  return new Participant(uid, participantFields({ displayName: `${uid} Person`, ...change }));
}

/** A story model with overrides. */
export function aStory(id: string, change: StoreFields = {}): Story {
  return new Story(id, storyFields(change));
}

/** A ready room state seen by `mod`, with overrides. */
export function aState(change: Partial<IRoomState> = {}): IRoomState {
  return {
    ...LOADING_ROOM,
    status: RoomStatus.Ready,
    uid: 'mod',
    room: aRoom(),
    people: [
      aPerson('mod', { displayName: 'Alex Kim' }),
      aPerson('maya', { displayName: 'Maya Chen' }),
    ],
    stories: [aStory('s1'), aStory('s2', { key: 'PAY-215', order: 2 })],
    ...change,
  };
}

/** A button's name as a screen reader reads it: its label, or its text without hidden parts. */
export function accessibleName(button: Element): string {
  const label = button.getAttribute('aria-label');
  if (label !== null) {
    return label;
  }
  return (
    [...button.childNodes]
      // Text and elements only: Angular leaves comment nodes ("container") in the template.
      .filter((node) => node.nodeType === Node.TEXT_NODE || node instanceof Element)
      .filter((node) => !(node instanceof Element && node.getAttribute('aria-hidden') === 'true'))
      .map((node) => node.textContent)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** The card button named `name`, e.g. "Vote 5", under `root`. */
export function cardNamed(root: Element, name: string): HTMLButtonElement | undefined {
  return [...root.querySelectorAll<HTMLButtonElement>('.card')].find(
    (button) => accessibleName(button) === name,
  );
}
