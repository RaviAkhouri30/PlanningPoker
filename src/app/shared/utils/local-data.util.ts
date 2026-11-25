import { type StoreFields } from '@core/interfaces/i-realtime-store';
import { MAX_SAVED_ROOMS } from '@shared/constants/local-data.constants';
import { Animal } from '@shared/enums/animal.enum';
import { RoomRole } from '@shared/enums/room-role.enum';
import { type ILocalProfile } from '@shared/interfaces/i-local-profile';
import { type ISavedRoom } from '@shared/interfaces/i-saved-room';
import { FieldReader } from './fields.util';

const ANIMALS = Object.values(Animal);
const ROLES = Object.values(RoomRole);

/** Saved text may be from an older version or edited by hand: unreadable means "nothing". */
function parseJson(raw: string | null): unknown {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is StoreFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @returns The saved profile, or `null` when there is none or it is unreadable. */
export function parseProfile(raw: string | null): ILocalProfile | null {
  const value = parseJson(raw);
  if (!isRecord(value)) {
    return null;
  }
  const name = FieldReader.text(value, 'name').trim();
  const avatar = FieldReader.oneOfOrNull(value, 'avatar', ANIMALS);
  return name === '' || avatar === null ? null : { name, avatar };
}

function parseRoom(value: unknown): ISavedRoom | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = FieldReader.text(value, 'id');
  const role = FieldReader.oneOfOrNull(value, 'role', ROLES);
  if (id === '' || role === null) {
    return null;
  }
  return {
    id,
    name: FieldReader.text(value, 'name'),
    code: FieldReader.text(value, 'code'),
    role,
    lastVisit: FieldReader.number(value, 'lastVisit'),
  };
}

/** @returns The saved rooms, most recent first; unreadable entries are dropped. */
export function parseRooms(raw: string | null): ISavedRoom[] {
  const value = parseJson(raw);
  return Array.isArray(value)
    ? sortRooms(value.map(parseRoom).filter((room) => room !== null))
    : [];
}

/** @returns The rooms, most recently visited first, at most `MAX_SAVED_ROOMS`. */
export function sortRooms(rooms: readonly ISavedRoom[]): ISavedRoom[] {
  return [...rooms].sort((a, b) => b.lastVisit - a.lastVisit).slice(0, MAX_SAVED_ROOMS);
}
