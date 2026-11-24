import {
  createRoomCode,
  createRoomId,
  normaliseRoomCode,
  randomCharacters,
  slugify,
} from './room-id.util';

describe('room ids and codes', () => {
  const first = (): number => 0;

  it('should slugify a name into lower-case words', () => {
    expect(slugify('  Sprint 42 · Planning! ')).toBe('sprint-42-planning');
  });

  it('should cut a long slug without a trailing dash', () => {
    expect(slugify('a'.repeat(31) + ' bcd')).toBe('a'.repeat(31));
  });

  it('should draw characters from the code alphabet', () => {
    expect(randomCharacters(3, first)).toBe('AAA');
    expect(randomCharacters(1, () => 0.999)).toBe('9');
  });

  it('should build a room id from the slug and a random suffix', () => {
    expect(createRoomId('Sprint 42', first)).toBe('sprint-42-aaaaaa');
  });

  it('should fall back to "room" when the name has no letters or digits', () => {
    expect(createRoomId('···', first)).toBe('room-aaaaaa');
  });

  it('should build a code of four and two characters', () => {
    expect(createRoomCode(first)).toBe('AAAA-AA');
  });

  it.each([
    ['x7k2-91', 'X7K2-91'],
    [' X7K291 ', 'X7K2-91'],
  ])('should normalise %s to %s', (input, code) => {
    expect(normaliseRoomCode(input)).toBe(code);
  });

  it('should reject input that cannot be a code', () => {
    expect(normaliseRoomCode('X7K2')).toBeNull();
  });
});
