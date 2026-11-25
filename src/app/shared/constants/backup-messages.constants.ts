/** The words around a CSV backup, shared by My rooms and the room. */
export const BACKUP_MESSAGES = {
  savedPrefix: 'Backup saved: ',
  skippedOne: '1 room couldn’t be read and was left out.',
  skippedManySuffix: ' rooms couldn’t be read and were left out.',
  failed: 'Couldn’t make the backup. The room may be gone; check your connection and try again.',
} as const;
