import { timeAgo } from './time-ago.util';

describe('timeAgo', () => {
  const now = Date.UTC(2026, 10, 25, 12);
  const minute = 60_000;

  it('should say just now when less than a minute has passed', () => {
    expect(timeAgo(now - 30_000, now)).toBe('just now');
    expect(timeAgo(now + minute, now)).toBe('just now');
  });

  it('should name the largest unit that fits when time has passed', () => {
    expect(timeAgo(now - 5 * minute, now)).toBe('5 minutes ago');
    expect(timeAgo(now - 3 * 60 * minute, now)).toBe('3 hours ago');
    expect(timeAgo(now - 24 * 60 * minute, now)).toBe('yesterday');
    expect(timeAgo(now - 15 * 24 * 60 * minute, now)).toBe('2 weeks ago');
  });
});
