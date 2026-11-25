import { Animal } from '@shared/enums/animal.enum';
import { RoomRole } from '@shared/enums/room-role.enum';
import { parseProfile, parseRooms, sortRooms } from './local-data.util';

describe('local data', () => {
  const room = { id: 'r1', name: 'Sprint', code: 'X7K2-92', role: RoomRole.Player, lastVisit: 5 };

  it('should read a saved profile when it has a name and a known animal', () => {
    expect(parseProfile('{"name":" Maya ","avatar":"owl"}')).toEqual({
      name: 'Maya',
      avatar: Animal.Owl,
    });
  });

  it('should read no profile when nothing is saved or it is unreadable', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile('not json')).toBeNull();
    expect(parseProfile('[1]')).toBeNull();
    expect(parseProfile('{"name":"","avatar":"owl"}')).toBeNull();
    expect(parseProfile('{"name":"Maya","avatar":"dragon"}')).toBeNull();
  });

  it('should read the saved rooms newest first and drop broken entries', () => {
    const saved = JSON.stringify([
      room,
      { ...room, id: 'r2', lastVisit: 9 },
      { id: '', role: 'player' },
      { id: 'r3', role: 'boss' },
      'oops',
    ]);

    expect(parseRooms(saved).map((saved) => saved.id)).toEqual(['r2', 'r1']);
  });

  it('should read no rooms when nothing is saved or it is not a list', () => {
    expect(parseRooms(null)).toEqual([]);
    expect(parseRooms('{"id":"r1"}')).toEqual([]);
  });

  it('should fill missing room details with blanks when an entry is partial', () => {
    expect(parseRooms('[{"id":"r1","role":"moderator"}]')).toEqual([
      { id: 'r1', name: '', code: '', role: RoomRole.Moderator, lastVisit: 0 },
    ]);
  });

  it('should keep only the most recent rooms when there are too many', () => {
    const many = Array.from({ length: 60 }, (_, index) => ({ ...room, lastVisit: index }));

    const sorted = sortRooms(many);

    expect(sorted).toHaveLength(50);
    expect(sorted[0]?.lastVisit).toBe(59);
  });
});
