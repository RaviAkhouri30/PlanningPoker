/**
 * Firestore paths of the data model (docs/architecture/data-model.md). The single place that
 * spells them, for the services and the rules tests.
 */
export const STORE_PATHS = {
  room: (roomId: string): string => `rooms/${roomId}`,
  roomCode: (code: string): string => `roomCodes/${code}`,
  participants: (roomId: string): string => `rooms/${roomId}/participants`,
  participant: (roomId: string, uid: string): string => `rooms/${roomId}/participants/${uid}`,
  stories: (roomId: string): string => `rooms/${roomId}/stories`,
  story: (roomId: string, storyId: string): string => `rooms/${roomId}/stories/${storyId}`,
  round: (roomId: string, round: number): string => `rooms/${roomId}/rounds/${String(round)}`,
  votes: (roomId: string, round: number): string => `rooms/${roomId}/rounds/${String(round)}/votes`,
  vote: (roomId: string, round: number, uid: string): string =>
    `rooms/${roomId}/rounds/${String(round)}/votes/${uid}`,
} as const;
