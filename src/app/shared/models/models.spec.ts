import { DeckType } from '@shared/enums/deck-type.enum';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { StoryStatus } from '@shared/enums/story-status.enum';
import { Participant } from './participant.model';
import { Room } from './room.model';
import { Story } from './story.model';

describe('data models', () => {
  it('should read a room and fall back on missing fields', () => {
    const room = new Room('r1', { name: 'Sprint', deck: 'tshirt', round: 3, moderatorUid: 'u1' });

    expect(room.name).toBe('Sprint');
    expect(room.deckType).toBe(DeckType.TShirt);
    expect(room.deck.label).toBe('T-shirt');
    expect(room.round).toBe(3);
    expect(room.autoReveal).toBe(true);
    expect(room.revealed).toBe(false);
    expect(room.activeStoryId).toBeNull();
    expect(room.roundStartedAt).toBeNull();
  });

  it('should know its moderator', () => {
    const room = new Room('r1', { moderatorUid: 'u1' });

    expect(room.isModeratedBy('u1')).toBe(true);
    expect(room.isModeratedBy('u2')).toBe(false);
    expect(room.isModeratedBy(null)).toBe(false);
    expect(room.isModeratedBy(undefined)).toBe(false);
  });

  it('should read a participant with colours, initials and voting state', () => {
    const person = new Participant('u1', {
      displayName: 'Alex Kim',
      colour: 2,
      role: 'spectator',
      avatar: 'owl',
      votedRound: 4,
      lastSeenAt: 1000,
    });

    expect(person.initials).toBe('AK');
    expect(person.colour.label).toBe('Mint');
    expect(person.role).toBe(ParticipantRole.Spectator);
    expect(person.avatar).toBe('owl');
    expect(person.isPlayer).toBe(false);
    expect(person.hasVotedIn(4)).toBe(true);
    expect(person.hasVotedIn(5)).toBe(false);
    expect(person.isOnline(1500, 600)).toBe(true);
    expect(person.isOnline(5000, 600)).toBe(false);
  });

  it('should fall back to the first colour and offline when fields are missing', () => {
    const person = new Participant('u1', { colour: 99 });

    expect(person.colour.label).toBe('Lilac');
    expect(person.avatar).toBeNull();
    expect(person.isPlayer).toBe(true);
    expect(person.isOnline(0, 1)).toBe(false);
  });

  it('should read a story', () => {
    const story = new Story('s1', {
      key: '#1',
      title: 'Login',
      status: 'done',
      estimate: '5',
      rounds: 2,
    });

    expect(story.status).toBe(StoryStatus.Done);
    expect(story.isPending).toBe(false);
    expect(story.estimate).toBe('5');
    expect(new Story('s2', {}).isPending).toBe(true);
  });

  describe('room countdown', () => {
    const start = 1_000_000;

    it('should count down from a minute with the lock on when the room predates the countdown', () => {
      const room = new Room('r1', { roundStartedAt: start });

      expect([room.timerSeconds, room.lockOnTimeUp]).toEqual([60, true]);
      expect(room.secondsLeft(start)).toBe(60);
      expect(room.secondsLeft(start + 40_500)).toBe(20);
    });

    it('should lock voting when the countdown reaches zero', () => {
      const room = new Room('r1', { roundStartedAt: start, timerSeconds: 30 });

      expect(room.isVotingLocked(start + 29_999)).toBe(false);
      expect(room.secondsLeft(start + 31_000)).toBe(0);
      expect(room.isVotingLocked(start + 30_000)).toBe(true);
    });

    it('should keep voting open at zero when the lock is off or the cards are flipped', () => {
      const late = start + 90_000;

      expect(
        new Room('r1', { roundStartedAt: start, lockOnTimeUp: false }).isVotingLocked(late),
      ).toBe(false);
      expect(new Room('r1', { roundStartedAt: start, revealed: true }).isVotingLocked(late)).toBe(
        false,
      );
    });

    it('should show the full countdown when the server has not stamped the start yet', () => {
      expect(new Room('r1', { timerSeconds: 120 }).secondsLeft(start)).toBe(120);
    });

    it('should never show more than the countdown when the start is a moment ahead', () => {
      expect(new Room('r1', { roundStartedAt: start + 800 }).secondsLeft(start)).toBe(60);
    });
  });
});
