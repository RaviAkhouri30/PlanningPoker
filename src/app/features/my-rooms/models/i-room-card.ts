/** One room on My rooms, ready to show. */
export interface IRoomCard {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  /** e.g. "Moderator". */
  readonly roleLabel: string;
  /** e.g. "Opened yesterday". */
  readonly visitLabel: string;
  /** Router commands that open the room. */
  readonly open: readonly string[];
}
