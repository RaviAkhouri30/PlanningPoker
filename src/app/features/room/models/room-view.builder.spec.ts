import { TEST_NOW } from '@shared/testing/test-backend';
import { aPerson, aRoom, aState, aStory } from '../testing/room-fixtures';
import { LOADING_ROOM, StoryTab } from './i-room-state';
import { SeatSlot } from './i-seat-view';
import { ROOM_MESSAGES } from './room-messages.constants';
import { RoomView } from './room-view.builder';

describe('RoomView', () => {
  it('should find the active story, me and the players', () => {
    const state = aState({ people: [aPerson('mod'), aPerson('sam', { role: 'spectator' })] });

    expect(RoomView.activeStory(state)?.id).toBe('s1');
    expect(RoomView.me(state)?.uid).toBe('mod');
    expect(RoomView.players(state).map((person) => person.uid)).toEqual(['mod']);
    expect(RoomView.activeStory(aState({ room: aRoom({ activeStoryId: null }) }))).toBeNull();
    expect(RoomView.me(aState({ uid: 'nobody' }))).toBeNull();
  });

  it('should seat players first, with "You" for me and their voting state', () => {
    const state = aState({
      people: [
        aPerson('sam', { displayName: 'Sam Okafor', role: 'spectator' }),
        aPerson('mod', { displayName: 'Alex Kim', votedRound: 1 }),
        aPerson('maya', { displayName: 'Maya Chen', lastSeenAt: 0 }),
      ],
    });

    const seats = RoomView.seats(state, TEST_NOW);

    expect(seats.map((seat) => [seat.shortName, seat.slot, seat.status])).toEqual([
      ['You', SeatSlot.Card, ROOM_MESSAGES.voted],
      ['Maya', SeatSlot.Thinking, ROOM_MESSAGES.thinking],
      ['Sam', SeatSlot.Thinking, ROOM_MESSAGES.watching],
    ]);
    expect(seats[0]).toMatchObject({
      fullName: 'Alex Kim (you)',
      roleLabel: 'Moderator · player',
      online: true,
    });
    expect(seats[1]).toMatchObject({ online: false, flipDelay: 110, roleLabel: 'Player' });
    expect(seats[2]?.roleLabel).toBe('Spectator');
    expect(RoomView.seats(LOADING_ROOM, TEST_NOW)).toEqual([]);
  });

  it('should show cards and "No vote" once revealed, and "Ready" with no story', () => {
    const revealed = aState({
      room: aRoom({ revealed: true }),
      people: [aPerson('mod', { votedRound: 1 }), aPerson('maya')],
      roundVotes: new Map([['mod', '5']]),
    });
    const idle = aState({ room: aRoom({ activeStoryId: null }) });

    expect(
      RoomView.seats(revealed, TEST_NOW).map((seat) => [seat.slot, seat.card, seat.status]),
    ).toEqual([
      [SeatSlot.Card, '5', 'Voted 5'],
      [SeatSlot.Empty, null, ROOM_MESSAGES.noVote],
    ]);
    expect(RoomView.seats(idle, TEST_NOW).map((seat) => [seat.slot, seat.status])).toEqual([
      [SeatSlot.Empty, ROOM_MESSAGES.ready],
      [SeatSlot.Empty, ROOM_MESSAGES.ready],
    ]);
  });

  it('should build stats from the revealed players’ votes only', () => {
    const state = aState({
      room: aRoom({ revealed: true }),
      people: [
        aPerson('mod'),
        aPerson('maya', { displayName: 'Maya Chen' }),
        aPerson('sam', { role: 'spectator' }),
      ],
      roundVotes: new Map([
        ['mod', '5'],
        ['maya', '8'],
        ['sam', '13'],
      ]),
    });

    expect(RoomView.stats(state)?.numericCount).toBe(2);
    expect(RoomView.stats(aState())).toBeNull();
  });

  it('should count votes and decide when to reveal automatically', () => {
    const allVoted = aState({
      people: [aPerson('mod', { votedRound: 1 }), aPerson('maya', { votedRound: 1 })],
    });

    expect(RoomView.votedCount(allVoted)).toBe(2);
    expect(RoomView.autoRevealRound(allVoted)).toBe(1);
    expect(RoomView.autoRevealRound(aState())).toBeNull();
    expect(RoomView.autoRevealRound({ ...allVoted, uid: 'maya' })).toBeNull();
    expect(
      RoomView.autoRevealRound({ ...allVoted, room: aRoom({ autoReveal: false }) }),
    ).toBeNull();
    expect(RoomView.autoRevealRound({ ...allVoted, people: [] })).toBeNull();
    expect(RoomView.votedCount(LOADING_ROOM)).toBe(0);
  });

  it('should pick the next pending story and filter the list', () => {
    const state = aState({
      stories: [aStory('s1'), aStory('s2', { status: 'done', estimate: '3' }), aStory('s3')],
    });

    expect(RoomView.nextStory(state)?.id).toBe('s3');
    expect(RoomView.nextStory(aState({ stories: [aStory('s1')] }))).toBeNull();
    expect(RoomView.storiesFor(state, StoryTab.Active).map((story) => story.id)).toEqual([
      's1',
      's3',
    ]);
    expect(RoomView.storiesFor(state, StoryTab.Done).map((story) => story.id)).toEqual(['s2']);
    expect(RoomView.storiesFor(state, StoryTab.All)).toHaveLength(3);
  });

  it('should count who is online', () => {
    expect(RoomView.onlineCount(aState(), TEST_NOW)).toBe(2);
    expect(RoomView.onlineCount(aState(), TEST_NOW + 10 * 60_000)).toBe(0);
  });
});
