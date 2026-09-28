import type { Period } from 'shared/types';

const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const dayAndTime = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatChartTime = (timestamp: number, period: Period) =>
  (period === '1d' ? time : dayAndTime).format(timestamp);
