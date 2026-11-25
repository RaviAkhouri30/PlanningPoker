import { RoomRole } from '@shared/enums/room-role.enum';

/** The words on My rooms. */
export const MY_ROOMS_MESSAGES = {
  title: 'My rooms',
  welcomePrefix: 'Welcome back, ',
  untitled: 'Untitled room',
  openedPrefix: 'Opened ',
  forgotten: 'Removed from My rooms. The room itself is still there.',
  oneRoom: 'room',
  manyRooms: 'rooms',
} as const;

/** How each role reads on a room card. */
export const ROLE_LABELS: ReadonlyMap<RoomRole, string> = new Map([
  [RoomRole.Moderator, 'Moderator'],
  [RoomRole.Player, 'Player'],
  [RoomRole.Spectator, 'Spectator'],
]);
