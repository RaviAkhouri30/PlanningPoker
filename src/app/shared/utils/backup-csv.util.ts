import { StoryStatus } from '@shared/enums/story-status.enum';
import { type IRoomBackup } from '@shared/interfaces/i-room-backup';

/** Excel reads UTF-8 (names with accents, the ½ card) only with a byte order mark. */
const BYTE_ORDER_MARK = '﻿';
const LINE_END = '\r\n';
/** A cell starting with one of these is a formula to a spreadsheet; it is defused with a `'`. */
const FORMULA_START = /^[=+\-@\t\r]/;
const STORY_COLUMNS = [
  'Room',
  'Room code',
  'Key',
  'Story',
  'Notes',
  'Status',
  'Estimate',
  'Rounds',
] as const;
const STATUS_LABELS: ReadonlyMap<StoryStatus, string> = new Map([
  [StoryStatus.Pending, 'Not estimated'],
  [StoryStatus.Done, 'Estimated'],
  [StoryStatus.Skipped, 'Skipped'],
]);
/** The column for a vote whose voter has since left the room. */
const FORMER_MEMBER = 'Former member';

/** One story's row before the voter columns are known. */
interface IStoryRow {
  readonly cells: readonly string[];
  /** Cards by voter column name. */
  readonly votes: ReadonlyMap<string, string>;
}

/**
 * @returns A spreadsheet-safe, quoted CSV cell: a leading formula character is defused, so
 *   opening the backup can't run anything someone typed into a story title.
 */
export function csvCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** Voter column names for one room: display names, numbered when two people share one. */
function voterNames(backup: IRoomBackup): ReadonlyMap<string, string> {
  const seen = new Map<string, number>();
  return new Map(
    backup.people.map((person) => {
      const count = (seen.get(person.displayName) ?? 0) + 1;
      seen.set(person.displayName, count);
      const name = count === 1 ? person.displayName : `${person.displayName} (${String(count)})`;
      return [person.uid, name] as const;
    }),
  );
}

function roomRows(backup: IRoomBackup): IStoryRow[] {
  const names = voterNames(backup);
  return backup.stories.map((story) => ({
    cells: [
      backup.room.name,
      backup.room.code,
      story.key,
      story.title,
      story.description,
      STATUS_LABELS.get(story.status) ?? story.status,
      story.estimate ?? '',
      String(story.rounds),
    ],
    votes: new Map(
      [...(backup.votes.get(story.id) ?? new Map<string, string>())].map(
        ([uid, card]) => [names.get(uid) ?? FORMER_MEMBER, card] as const,
      ),
    ),
  }));
}

/**
 * A backup of one or more rooms as CSV: one row per story, with its estimate and one column per
 * person holding their card in the story's last revealed round.
 * @returns UTF-8 text with a byte order mark, a header row and CRLF line ends.
 */
export function backupCsv(backups: readonly IRoomBackup[]): string {
  const rows = backups.flatMap(roomRows);
  const voters = [...new Set(rows.flatMap((row) => [...row.votes.keys()]))];
  const lines = [
    [...STORY_COLUMNS, ...voters],
    ...rows.map((row) => [...row.cells, ...voters.map((voter) => row.votes.get(voter) ?? '')]),
  ];
  return (
    BYTE_ORDER_MARK + lines.map((line) => line.map(csvCell).join(',')).join(LINE_END) + LINE_END
  );
}
