import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { type Story } from '@shared/models/story.model';

/** Cards by voter uid. */
export type BackupVotes = ReadonlyMap<string, string>;

/** Everything a CSV backup holds about one room, read once. */
export interface IRoomBackup {
  readonly room: Room;
  readonly people: readonly Participant[];
  /** In list order. */
  readonly stories: readonly Story[];
  /** By story id: the cards of the story's last revealed round. */
  readonly votes: ReadonlyMap<string, BackupVotes>;
}
