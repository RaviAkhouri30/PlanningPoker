import { BACKUP_MESSAGES } from '@shared/constants/backup-messages.constants';
import { type IBackupResult } from '@shared/services/room-backup.service';

/**
 * @param result What the download did.
 * @returns The toast: the file's name, and how many rooms were left out, if any.
 */
export function backupNotice(result: IBackupResult): string {
  const saved = BACKUP_MESSAGES.savedPrefix + result.fileName;
  if (result.skipped === 0) {
    return saved;
  }
  const skipped =
    result.skipped === 1
      ? BACKUP_MESSAGES.skippedOne
      : String(result.skipped) + BACKUP_MESSAGES.skippedManySuffix;
  return `${saved}. ${skipped}`;
}
