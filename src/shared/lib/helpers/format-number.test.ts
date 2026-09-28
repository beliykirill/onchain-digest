import { describe, expect, it } from 'vitest';
import { formatPercent, formatTokenAmount, formatUsd } from './format-number';

describe('formatUsd', () => {
  it.each([
    [0, '$0.00'],
    [0.004, '<$0.01'],
    [0.42, '$0.42'],
    [312.4, '$312.40'],
    [999.994, '$999.99'],
    [1_000, '$1,000'],
    [57_320.05, '$57,320'],
    [999_999, '$999,999'],
    [1_000_000, '$1M'],
    [1_456_343.8, '$1.46M'],
    [2_021_646_701, '$2.02B'],
    [-9_640_297.5, '−$9.64M'],
    [-0.001, '−<$0.01'],
    [Number.NaN, '$0.00'],
  ])('%s → %s', (value, expected) => {
    expect(formatUsd(value)).toBe(expected);
  });

  it('adds a plus sign to positive changes when signed', () => {
    expect(formatUsd(312, { signed: true })).toBe('+$312.00');
    expect(formatUsd(-312, { signed: true })).toBe('−$312.00');
    expect(formatUsd(0, { signed: true })).toBe('$0.00');
  });
});

describe('formatPercent', () => {
  it.each([
    [0, '0%'],
    [0.004, '+<0.01%'],
    [0.34, '+0.34%'],
    [2.37, '+2.4%'],
    [-27.345, '−27.3%'],
    [179.6, '+180%'],
    [12_345.6, '+12,346%'],
  ])('%s → %s', (value, expected) => {
    expect(formatPercent(value)).toBe(expected);
  });

  it('can omit the plus sign', () => {
    expect(formatPercent(2.4, { signed: false })).toBe('2.4%');
    expect(formatPercent(-2.4, { signed: false })).toBe('−2.4%');
  });
});

describe('formatTokenAmount', () => {
  it.each([
    [0, '0'],
    [0.00000231, '<0.0001'],
    [0.002345678, '0.002346'],
    [0.5, '0.5'],
    [1.23456789, '1.2346'],
    [26, '26'],
    [412.4846, '412.48'],
    [1_200, '1,200'],
    [63_245.553, '63,245.55'],
    [516_343.65, '516,344'],
    [1_157_920, '1.16M'],
    [3.5e12, '3.5T'],
    [1.2e20, '1.2e20'],
    [-100, '−100'],
  ])('%s → %s', (value, expected) => {
    expect(formatTokenAmount(value)).toBe(expected);
  });
});
