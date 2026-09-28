import { describe, expect, it } from 'vitest';
import { findNearestPoint } from './find-nearest-point';
import { resamplePoints } from './resample-points';

const series = [
  { timestamp: 0, valueUsd: 100 },
  { timestamp: 10, valueUsd: 200 },
  { timestamp: 30, valueUsd: 0 },
];

describe('resamplePoints', () => {
  it('returns exactly the requested number of evenly spaced points', () => {
    const points = resamplePoints(series, 4);

    expect(points.map((p) => p.timestamp)).toEqual([0, 10, 20, 30]);
  });

  it('interpolates values linearly between neighbours', () => {
    expect(resamplePoints(series, 4).map((p) => p.valueUsd)).toEqual([100, 200, 100, 0]);
  });

  it('keeps both ends intact when downsampling a dense series', () => {
    const dense = Array.from({ length: 289 }, (_, i) => ({ timestamp: i * 300, valueUsd: i }));
    const points = resamplePoints(dense, 120);

    expect(points).toHaveLength(120);
    expect(points[0]).toEqual(dense[0]);
    expect(points.at(-1)?.valueUsd).toBeCloseTo(288, 6);
  });

  it('leaves series with fewer than two points alone', () => {
    expect(resamplePoints([], 10)).toEqual([]);
    expect(resamplePoints([{ timestamp: 1, valueUsd: 5 }], 10)).toHaveLength(1);
  });
});

describe('findNearestPoint', () => {
  it('picks the closest point on either side', () => {
    expect(findNearestPoint(series, 4)?.timestamp).toBe(0);
    expect(findNearestPoint(series, 6)?.timestamp).toBe(10);
    expect(findNearestPoint(series, 25)?.timestamp).toBe(30);
  });

  it('clamps outside the range', () => {
    expect(findNearestPoint(series, -50)?.timestamp).toBe(0);
    expect(findNearestPoint(series, 500)?.timestamp).toBe(30);
  });

  it('returns null for an empty series', () => {
    expect(findNearestPoint([], 1)).toBeNull();
  });
});
