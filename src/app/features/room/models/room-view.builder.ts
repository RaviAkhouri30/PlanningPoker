import { ONLINE_WINDOW_MS } from '@shared/constants/room.constants';
import { SELF_NAME } from '@shared/constants/voting.constants';
import { type IBallot } from '@shared/interfaces/i-ballot';
import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { type Story } from '@shared/models/story.model';
import { VotingStats } from '@shared/models/voting-stats.model';
import { firstNameOf } from '@shared/utils/display.util';
import { type IRoomState, StoryTab } from './i-room-state';
import { type ISeatView, SeatSlot } from './i-seat-view';
import { FLIP_STAGGER_MS, ROOM_MESSAGES } from './room-messages.constants';

/** Pure derivations of the room page's view from its state; the view model only wires them. */
export const RoomView = {
  /** @returns The current story, or `null`. */
  activeStory(state: IRoomState): Story | null {
    const id = state.room?.activeStoryId ?? null;
    return state.stories.find((story) => story.id === id) ?? null;
  },

  /** @returns The signed-in person's seat, or `null`. */
  me(state: IRoomState): Participant | null {
    return state.people.find((person) => person.uid === state.uid) ?? null;
  },

  /** @returns The people who vote. */
  players(state: IRoomState): readonly Participant[] {
    return state.people.filter((person) => person.isPlayer);
  },

  /** @returns Everyone as seats, players first, at `now`. */
  seats(state: IRoomState, now: number): readonly ISeatView[] {
    const room = state.room;
    if (room === null) {
      return [];
    }
    const hasStory = RoomView.activeStory(state) !== null;
    const ordered = [
      ...RoomView.players(state),
      ...state.people.filter((person) => !person.isPlayer),
    ];
    return ordered.map((person, index) => seatOf(person, { state, room, hasStory, now, index }));
  },

  /** @returns The smart-voting stats once the round is revealed, else `null`. */
  stats(state: IRoomState): VotingStats | null {
    const room = state.room;
    if (!room?.revealed) {
      return null;
    }
    const ballots: IBallot[] = RoomView.players(state).flatMap((person) => {
      const card = state.roundVotes.get(person.uid);
      return card === undefined
        ? []
        : [{ voterName: firstNameOf(person.displayName), isMine: person.uid === state.uid, card }];
    });
    return new VotingStats(room.deck, ballots);
  },

  /** @returns How many players have voted in the current round. */
  votedCount(state: IRoomState): number {
    const round = state.room?.round ?? 0;
    return RoomView.players(state).filter((person) => person.hasVotedIn(round)).length;
  },

  /** @returns The round to reveal automatically, or `null` when it shouldn't happen. */
  autoRevealRound(state: IRoomState): number | null {
    const room = state.room;
    const players = RoomView.players(state);
    const ready =
      room !== null &&
      room.autoReveal &&
      !room.revealed &&
      room.isModeratedBy(state.uid) &&
      RoomView.activeStory(state) !== null &&
      players.length > 0 &&
      players.every((person) => person.hasVotedIn(room.round));
    return ready ? room.round : null;
  },

  /** @returns The first pending story after the current one in list order, or `null`. */
  nextStory(state: IRoomState): Story | null {
    const currentId = state.room?.activeStoryId ?? null;
    return state.stories.find((story) => story.isPending && story.id !== currentId) ?? null;
  },

  /** @returns The stories the panel lists for `tab`. */
  storiesFor(state: IRoomState, tab: StoryTab): readonly Story[] {
    if (tab === StoryTab.All) {
      return state.stories;
    }
    const pending = tab === StoryTab.Active;
    return state.stories.filter((story) => story.isPending === pending);
  },

  /** @returns How many people were seen recently. */
  onlineCount(state: IRoomState, now: number): number {
    return state.people.filter((person) => person.isOnline(now, ONLINE_WINDOW_MS)).length;
  },
};

interface ISeatContext {
  readonly state: IRoomState;
  readonly room: Room;
  readonly hasStory: boolean;
  readonly now: number;
  readonly index: number;
}

function seatOf(person: Participant, context: ISeatContext): ISeatView {
  const { state, room } = context;
  const isMe = person.uid === state.uid;
  const voted = person.hasVotedIn(room.round);
  const card = room.revealed ? (state.roundVotes.get(person.uid) ?? null) : null;
  return {
    uid: person.uid,
    shortName: isMe ? SELF_NAME : firstNameOf(person.displayName),
    fullName: isMe ? `${person.displayName} (you)` : person.displayName,
    colour: person.colourIndex,
    isMe,
    isPlayer: person.isPlayer,
    roleLabel: roleLabelOf(person, room),
    online: person.isOnline(context.now, ONLINE_WINDOW_MS),
    slot: slotOf(voted, room.revealed, context.hasStory),
    card,
    status: statusOf(person, { voted, card, revealed: room.revealed, hasStory: context.hasStory }),
    flipDelay: context.index * FLIP_STAGGER_MS,
  };
}

function slotOf(voted: boolean, revealed: boolean, hasStory: boolean): SeatSlot {
  if (voted) {
    return SeatSlot.Card;
  }
  return revealed || !hasStory ? SeatSlot.Empty : SeatSlot.Thinking;
}

function roleLabelOf(person: Participant, room: Room): string {
  const role = person.isPlayer ? ROOM_MESSAGES.player : ROOM_MESSAGES.spectator;
  return room.isModeratedBy(person.uid)
    ? `${ROOM_MESSAGES.moderator} · ${role.toLowerCase()}`
    : role;
}

interface IVoteFacts {
  readonly voted: boolean;
  readonly card: string | null;
  readonly revealed: boolean;
  readonly hasStory: boolean;
}

function statusOf(person: Participant, facts: IVoteFacts): string {
  if (!person.isPlayer) {
    return ROOM_MESSAGES.watching;
  }
  if (facts.card !== null) {
    return `${ROOM_MESSAGES.voted} ${facts.card}`;
  }
  if (facts.voted) {
    return ROOM_MESSAGES.voted;
  }
  if (!facts.hasStory) {
    return ROOM_MESSAGES.ready;
  }
  return facts.revealed ? ROOM_MESSAGES.noVote : ROOM_MESSAGES.thinking;
}
