import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';

/** Where the join page is with loading the room. */
export enum JoinStatus {
  Loading = 'loading',
  Ready = 'ready',
  /** No room has this link. */
  Missing = 'missing',
  /** The room couldn't be read. */
  Failed = 'failed',
}

/** Which tab of the join card is showing. */
export enum JoinTab {
  Guest = 'guest',
  Account = 'account',
}

/** The join page's view state. */
export interface IJoinState {
  readonly status: JoinStatus;
  readonly room: Room | null;
  /** Everyone already in the room, in the order they joined. */
  readonly people: readonly Participant[];
  readonly tab: JoinTab;
  /** The seat is being taken. */
  readonly joining: boolean;
}

/** Before anything has loaded. */
export const LOADING_JOIN: IJoinState = {
  status: JoinStatus.Loading,
  room: null,
  people: [],
  tab: JoinTab.Guest,
  joining: false,
};
