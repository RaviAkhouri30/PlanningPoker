import { firstNameOf, formatClock, initialsOf } from './display.util';

describe('display helpers', () => {
  it.each([
    ['Alex Kim', 'AK'],
    ['maya', 'M'],
    ['Jo Ann Lee', 'JA'],
    ['  ', '?'],
  ])('should take the initials of %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });

  it('should take the first name', () => {
    expect(firstNameOf(' Alex Kim')).toBe('Alex');
  });

  it.each([
    [0, '00:00'],
    [65_400, '01:05'],
    [-5, '00:00'],
  ])('should show %i ms as %s', (elapsed, clock) => {
    expect(formatClock(elapsed)).toBe(clock);
  });
});
