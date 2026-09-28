const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export const formatRelativeTime = (date: string | number | Date, now: number = Date.now()) => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return '';

  const elapsed = now - timestamp;

  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;

  return shortDate.format(timestamp);
};
