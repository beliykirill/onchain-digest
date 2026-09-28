import type { IChartPoint } from 'shared/types';

export const resamplePoints = (points: IChartPoint[], count: number): IChartPoint[] => {
  const first = points[0];
  const last = points.at(-1);

  if (!first || !last || points.length < 2 || count < 2) return points;

  const span = last.timestamp - first.timestamp;
  let cursor = 0;

  return Array.from({ length: count }, (_, index) => {
    const timestamp = first.timestamp + (span * index) / (count - 1);

    while (cursor < points.length - 2 && points[cursor + 1]!.timestamp < timestamp) cursor += 1;

    const left = points[cursor]!;
    const right = points[cursor + 1]!;
    const ratio =
      right.timestamp === left.timestamp
        ? 0
        : Math.min(
            Math.max((timestamp - left.timestamp) / (right.timestamp - left.timestamp), 0),
            1,
          );

    return { timestamp, valueUsd: left.valueUsd + (right.valueUsd - left.valueUsd) * ratio };
  });
};
