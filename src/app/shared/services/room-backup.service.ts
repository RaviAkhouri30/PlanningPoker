import { Service, inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { type IRoomBackup } from '@shared/interfaces/i-room-backup';
import { backupCsv } from '@shared/utils/backup-csv.util';
import { RoomBackupReader } from './room-backup-reader.service';

/** What a backup download did. */
export interface IBackupResult {
  readonly fileName: string;
  /** Rooms in the file. */
  readonly saved: number;
  /** Rooms that couldn't be read (gone, or this browser is no longer in them). */
  readonly skipped: number;
}

const FILE_PREFIX = 'planning-poker-';
const ALL_ROOMS_NAME = 'rooms';
const CSV_TYPE = 'text/csv;charset=utf-8';

/** Builds a CSV backup of one or more rooms and hands it to the person as a file. */
@Service()
export class RoomBackupService {
  private readonly auth = inject(IAuthService);
  private readonly reader = inject(RoomBackupReader);
  private readonly saver = inject(IFileSaver);
  private readonly clock = inject(CLOCK);
  private readonly logger = inject(LoggerService);

  /**
   * @param roomIds The rooms to back up; one room names the file after it.
   * @returns The result once the file is saved; errors when no room could be read.
   */
  public download(roomIds: readonly string[]): Observable<IBackupResult> {
    // Wait for the saved session first: the rules let only the room's members read it, and My
    // rooms may be the first page to need the sign-in. take(1) + switchMap: one session, one read.
    return this.auth.user$.pipe(
      take(1),
      // forkJoin: each room is read once, in parallel, and the file is built from all of them.
      switchMap(() => forkJoin(roomIds.map((roomId) => this.readOrSkip(roomId)))),
      map((read) => read.filter((backup) => backup !== null)),
      // switchMap: one list of backups arrives, so there is only one file to save.
      switchMap((backups) => {
        if (backups.length === 0) {
          return throwError(() => new Error('No room could be read'));
        }
        const fileName = this.fileName(roomIds);
        return this.saver
          .save({ name: fileName, content: backupCsv(backups), type: CSV_TYPE })
          .pipe(
            map(() => ({
              fileName,
              saved: backups.length,
              skipped: roomIds.length - backups.length,
            })),
          );
      }),
    );
  }

  /** A room this browser can't read any more is left out of the file, not a failure. */
  private readOrSkip(roomId: string): Observable<IRoomBackup | null> {
    return this.reader.read(roomId).pipe(
      catchError((error: unknown) => {
        this.logger.error('Reading a room for a backup', error);
        return of(null);
      }),
    );
  }

  /** e.g. `planning-poker-sprint-42-x7k2ab-2026-11-25.csv`. */
  private fileName(roomIds: readonly string[]): string {
    const subject = roomIds.length === 1 ? (roomIds.at(0) ?? ALL_ROOMS_NAME) : ALL_ROOMS_NAME;
    const day = new Date(this.clock.now()).toISOString().split('T').at(0) ?? '';
    return `${FILE_PREFIX}${subject}-${day}.csv`;
  }
}
