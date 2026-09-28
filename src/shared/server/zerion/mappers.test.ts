import { describe, expect, it } from 'vitest';
import { toAsset, toChain, toPosition } from './mappers';
import { positionSchema } from './schemas';

describe('toAsset', () => {
  it('strips invisible characters from symbols and names', () => {
    expect(toAsset({ symbol: 'DENNY’S⁠', name: '​Denny’s ' }, 'id')).toMatchObject({
      symbol: 'DENNY’S',
      name: 'Denny’s',
    });
  });

  it('falls back when the symbol or name is missing', () => {
    expect(toAsset({ symbol: null, name: 'Wrapped Ether' }, 'weth').symbol).toBe('Wrapped Ether');
    expect(toAsset(null, 'x')).toMatchObject({ id: 'x', symbol: '???', verified: false });
  });
});

describe('toChain', () => {
  it('title-cases unknown chain ids', () => {
    expect(toChain('binance-smart-chain', new Map())).toMatchObject({
      name: 'Binance Smart Chain',
    });
  });
});

describe('toPosition', () => {
  const raw = (changes: unknown) =>
    positionSchema.parse({
      id: 'eth-ethereum',
      attributes: {
        quantity: { float: 2 },
        value: 5_000,
        price: 2_500,
        changes,
        fungible_info: { symbol: 'ETH', name: 'Ethereum', icon: null, flags: { verified: true } },
        flags: { is_trash: false },
      },
      relationships: { chain: { data: { id: 'ethereum' } }, fungible: { data: { id: 'eth' } } },
    });

  it('maps the 1d change', () => {
    expect(toPosition(raw({ absolute_1d: 50, percent_1d: 1 }), new Map()).change1d).toEqual({
      absoluteUsd: 50,
      percent: 1,
    });
  });

  it('treats a missing or partial change as unknown', () => {
    expect(toPosition(raw(null), new Map()).change1d).toBeNull();
    expect(toPosition(raw({ absolute_1d: null, percent_1d: 1 }), new Map()).change1d).toBeNull();
  });
});
