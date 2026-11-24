/** Text limits, mirrored by `firestore.rules` (keep the two in step). */
export const LIMITS = {
  displayName: 40,
  roomName: 60,
  storyKey: 16,
  storyTitle: 200,
  storyDescription: 2000,
  roomCode: 7,
} as const;
