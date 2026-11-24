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
      votedRound: 4,
      lastSeenAt: 1000,
    });

    expect(person.initials).toBe('AK');
    expect(person.colour.label).toBe('Mint');
    expect(person.role).toBe(ParticipantRole.Spectator);
    expect(person.isPlayer).toBe(false);
    expect(person.hasVotedIn(4)).toBe(true);
    expect(person.hasVotedIn(5)).toBe(false);
    expect(person.isOnline(1500, 600)).toBe(true);
    expect(person.isOnline(5000, 600)).toBe(false);
  });

  it('should fall back to the first colour and offline when fields are missing', () => {
    const person = new Participant('u1', { colour: 99 });

    expect(person.colour.label).toBe('Lilac');
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
});
