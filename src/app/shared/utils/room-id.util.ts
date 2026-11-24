import { type RandomSource } from '@core/interfaces/i-random';
import {
  CODE_ALPHABET,
  CODE_HEAD_LENGTH,
  CODE_TAIL_LENGTH,
  FALLBACK_ROOM_SLUG,
  ROOM_ID_SUFFIX_LENGTH,
  ROOM_SLUG_MAX_LENGTH,
} from '@shared/constants/room.constants';

/**
 * @param text Any text, e.g. a room name.
 * @returns Lower-case letters and digits joined by single dashes, at most 32 characters.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '')
    .slice(0, ROOM_SLUG_MAX_LENGTH)
    .replace(/-$/, '');
}

/**
 * @param length How many characters.
 * @param random The random source.
 * @returns Characters from the unambiguous code alphabet.
 */
export function randomCharacters(length: number, random: RandomSource): string {
  return Array.from({ length }, () =>
    CODE_ALPHABET.charAt(Math.floor(random() * CODE_ALPHABET.length)),
  ).join('');
}

/**
 * @param name The room's name.
 * @param random The random source.
 * @returns A readable, hard-to-guess id, e.g. `sprint-42-x7k2qp`.
 */
export function createRoomId(name: string, random: RandomSource): string {
  const slug = slugify(name) || FALLBACK_ROOM_SLUG;
  return `${slug}-${randomCharacters(ROOM_ID_SUFFIX_LENGTH, random).toLowerCase()}`;
}

/**
 * @param random The random source.
 * @returns A code to read aloud, e.g. `X7K2-91`.
 */
export function createRoomCode(random: RandomSource): string {
  return `${randomCharacters(CODE_HEAD_LENGTH, random)}-${randomCharacters(CODE_TAIL_LENGTH, random)}`;
}

/**
 * @param input What someone typed into "Got a code?".
 * @returns The code as stored (upper case, dash after four characters), or `null` when it can't be one.
 */
export function normaliseRoomCode(input: string): string | null {
  const characters = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (characters.length !== CODE_HEAD_LENGTH + CODE_TAIL_LENGTH) {
    return null;
  }
  return `${characters.slice(0, CODE_HEAD_LENGTH)}-${characters.slice(CODE_HEAD_LENGTH)}`;
}
