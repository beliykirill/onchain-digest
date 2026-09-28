import type { IChartPoint, Nullable } from 'shared/types';

export const findNearestPoint = (
  points: IChartPoint[],
  timestamp: number,
): Nullable<IChartPoint> => {
  if (!points.length) return null;

  let low = 0;
  let high = points.length - 1;

  while (high - low > 1) {
    const middle = (low + high) >> 1;

    if (points[middle]!.timestamp <= timestamp) low = middle;
    else high = middle;
  }

  const left = points[low]!;
  const right = points[high]!;

  return Math.abs(timestamp - left.timestamp) <= Math.abs(right.timestamp - timestamp)
    ? left
    : right;
};
