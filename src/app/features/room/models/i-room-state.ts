import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { type Story } from '@shared/models/story.model';
import { type RoundVotes } from '../services/votes.service';

/** Where the room page is with loading. */
export enum RoomStatus {
  Loading = 'loading',
  Ready = 'ready',
  /** No room has this link. */
  Missing = 'missing',
  /** The room couldn't be read. */
  Failed = 'failed',
}

/** Which stories the stories panel lists. */
export enum StoryTab {
  Active = 'active',
  Done = 'done',
  All = 'all',
}

/** The room page's view state: what the store says, plus this person's UI choices. */
export interface IRoomState {
  readonly status: RoomStatus;
  /** The signed-in person. */
  readonly uid: string;
  readonly room: Room | null;
  /** Everyone in the room, in the order they joined. */
  readonly people: readonly Participant[];
  /** Stories in list order. */
  readonly stories: readonly Story[];
  /** This person's card in the current round, or `null`. */
  readonly myCard: string | null;
  /** Every card of the current round once it's revealed; empty before. */
  readonly roundVotes: RoundVotes;
  readonly inviteOpen: boolean;
  readonly storyTab: StoryTab;
}

/** No votes. */
export const NO_VOTES: RoundVotes = new Map();

/** Before anything has loaded. */
export const LOADING_ROOM: IRoomState = {
  status: RoomStatus.Loading,
  uid: '',
  room: null,
  people: [],
  stories: [],
  myCard: null,
  roundVotes: NO_VOTES,
  inviteOpen: false,
  storyTab: StoryTab.Active,
};
