import { describe, expect, it } from 'vitest';
import type { IPosition } from 'shared/types';
import {
  computeTopMovers,
  getContributionUsd,
  type IPositionPeriodChange,
} from './compute-top-movers';

const position = (symbol: string, valueUsd: number | null): IPosition => ({
  id: `${symbol}-ethereum`,
  asset: { id: symbol.toLowerCase(), symbol, name: symbol, iconUrl: null, verified: true },
  chain: { id: 'ethereum', name: 'Ethereum', iconUrl: null },
  quantity: 1,
  valueUsd,
  priceUsd: valueUsd ?? 0,
  change1d: null,
});

const change = (
  symbol: string,
  valueUsd: number | null,
  absoluteUsd: number | null,
  percent: number | null = null,
): IPositionPeriodChange => ({ position: position(symbol, valueUsd), absoluteUsd, percent });

describe('getContributionUsd', () => {
  it('prefers the absolute change when the API provides it', () => {
    expect(getContributionUsd(change('ETH', 10_000, 300, 99))).toBe(300);
  });

  it('recovers the dollar change from a percentage', () => {
    expect(getContributionUsd(change('ETH', 10_300, null, 3))).toBeCloseTo(300, 6);
  });

  it('handles negative percentages', () => {
    expect(getContributionUsd(change('ETH', 9_000, null, -10))).toBeCloseTo(-1_000, 6);
  });

  it('returns null without a percentage, a value, or with an impossible -100%', () => {
    expect(getContributionUsd(change('ETH', 10_000, null, null))).toBeNull();
    expect(getContributionUsd(change('ETH', null, null, 5))).toBeNull();
    expect(getContributionUsd(change('ETH', 10, null, -100))).toBeNull();
  });
});

describe('computeTopMovers', () => {
  it('ranks by absolute dollar contribution, not by percentage', () => {
    const movers = computeTopMovers([change('PEPE', 9, 4, 80), change('ETH', 10_300, 300, 3)]);

    expect(movers.map((m) => m.asset.symbol)).toEqual(['ETH', 'PEPE']);
  });

  it('mixes gains and losses on one scale and keeps their signs', () => {
    const movers = computeTopMovers([
      change('ETH', 10_000, 300),
      change('BTC', 20_000, -500),
      change('SOL', 5_000, 100),
    ]);

    expect(movers.map((m) => [m.asset.symbol, m.contributionUsd])).toEqual([
      ['BTC', -500],
      ['ETH', 300],
      ['SOL', 100],
    ]);
  });

  it('computes each share against the sum of absolute contributions', () => {
    const movers = computeTopMovers([change('ETH', 10_000, 300), change('BTC', 20_000, -100)]);

    expect(movers.map((m) => m.shareOfChange)).toEqual([0.75, 0.25]);
    expect(movers.reduce((sum, m) => sum + m.shareOfChange, 0)).toBeCloseTo(1, 10);
  });

  it('drops positions with zero change', () => {
    const movers = computeTopMovers([change('USDC', 5_000, 0), change('ETH', 10_000, 50)]);

    expect(movers.map((m) => m.asset.symbol)).toEqual(['ETH']);
  });

  it('drops positions without any change data', () => {
    expect(computeTopMovers([change('NEW', 1_000, null, null)])).toEqual([]);
  });

  it('uses the percentage path when there is no absolute change', () => {
    const [mover] = computeTopMovers([change('ETH', 10_300, null, 3)]);

    expect(mover?.contributionUsd).toBeCloseTo(300, 6);
    expect(mover?.changePercent).toBe(3);
  });

  it('derives the percentage when only the absolute change is known', () => {
    const [mover] = computeTopMovers([change('ETH', 10_300, 300)]);

    expect(mover?.changePercent).toBeCloseTo(3, 6);
  });

  it('filters dust below the threshold, and unpriced positions', () => {
    const movers = computeTopMovers([
      change('DUST', 0.5, 0.4),
      change('NOPRICE', null, 10),
      change('ETH', 100, 1),
    ]);

    expect(movers.map((m) => m.asset.symbol)).toEqual(['ETH']);
    expect(movers[0]?.shareOfChange).toBe(1);
  });

  it('honours a custom dust threshold', () => {
    expect(computeTopMovers([change('ETH', 100, 1)], { minValueUsd: 1_000 })).toEqual([]);
  });

  it('works with a single asset', () => {
    const movers = computeTopMovers([change('ETH', 10_000, -250)]);

    expect(movers).toHaveLength(1);
    expect(movers[0]).toMatchObject({ contributionUsd: -250, shareOfChange: 1, valueUsd: 10_000 });
  });

  it('returns nothing for an empty portfolio', () => {
    expect(computeTopMovers([])).toEqual([]);
  });

  it('returns at most five movers', () => {
    const changes = Array.from({ length: 8 }, (_, i) => change(`T${i}`, 1_000, i + 1));

    expect(computeTopMovers(changes).map((m) => m.asset.symbol)).toEqual([
      'T7',
      'T6',
      'T5',
      'T4',
      'T3',
    ]);
  });
});
