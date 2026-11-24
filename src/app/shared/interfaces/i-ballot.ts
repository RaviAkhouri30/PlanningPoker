/** One revealed vote, as the stats read it. */
export interface IBallot {
  /** Who cast it, as shown to the room. */
  readonly voterName: string;
  /** Whether it's the current person's own vote (shown as "You"). */
  readonly isMine: boolean;
  /** The card. */
  readonly card: string;
}
