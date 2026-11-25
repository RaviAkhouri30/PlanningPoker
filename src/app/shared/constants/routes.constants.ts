/** First segment of a room's address: `/r/<roomId>`. */
export const ROOM_ROUTE_SEGMENT = 'r';

/** Last segment of a room's join form: `/r/<roomId>/join`. */
export const JOIN_ROUTE_SEGMENT = 'join';

/** The route parameter holding the room id. */
export const ROOM_ID_PARAM = 'roomId';

/**
 * @param roomId The room.
 * @returns The router commands for the room.
 */
export function roomCommands(roomId: string): string[] {
  return ['/', ROOM_ROUTE_SEGMENT, roomId];
}

/**
 * @param roomId The room.
 * @returns The router commands for the room's join form.
 */
export function joinCommands(roomId: string): string[] {
  return [...roomCommands(roomId), JOIN_ROUTE_SEGMENT];
}

/** The terms of use page: `/terms`. */
export const TERMS_ROUTE_SEGMENT = 'terms';

/** The router commands for the terms page. */
export const TERMS_COMMANDS: readonly string[] = ['/', TERMS_ROUTE_SEGMENT];
