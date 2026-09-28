import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './format-relative-time';

const NOW = Date.parse('2026-09-28T12:00:00Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe('formatRelativeTime', () => {
  it.each([
    [ago(0), 'just now'],
    [ago(59_000), 'just now'],
    [ago(60_000), '1m ago'],
    [ago(59 * 60_000), '59m ago'],
    [ago(2 * 3_600_000), '2h ago'],
    [ago(23.9 * 3_600_000), '23h ago'],
    [ago(24 * 3_600_000), '1d ago'],
    [ago(6 * 86_400_000), '6d ago'],
    [ago(8 * 86_400_000), 'Sep 20'],
  ])('%s → %s', (date, expected) => {
    expect(formatRelativeTime(date, NOW)).toBe(expected);
  });

  it('treats timestamps slightly in the future as just now', () => {
    expect(formatRelativeTime(NOW + 90_000, NOW)).toBe('just now');
  });

  it('returns an empty string for invalid dates', () => {
    expect(formatRelativeTime('not a date', NOW)).toBe('');
  });
});
