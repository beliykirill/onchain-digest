import { describe, expect, it } from 'vitest';
import { getAddressKind, isValidAddress, normalizeAddress, shortenAddress } from './address';

const VITALIK = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const SOLANA = '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9';

describe('getAddressKind', () => {
  it.each([
    [VITALIK, 'evm'],
    [VITALIK.toLowerCase(), 'evm'],
    [`  ${VITALIK}  `, 'evm'],
    [SOLANA, 'solana'],
  ])('recognises %s as %s', (input, kind) => {
    expect(getAddressKind(input)).toBe(kind);
  });

  it.each([
    ['', 'empty'],
    ['0x', 'prefix only'],
    [VITALIK.slice(0, -1), '39 hex chars'],
    [`${VITALIK}0`, '41 hex chars'],
    ['0xZZdA6BF26964aF9D7eEd9e03E53415D37aA96045', 'non-hex'],
    ['vitalik.eth', 'ENS name'],
    ['0OIl' + SOLANA.slice(4), 'base58-excluded characters'],
    [SOLANA.slice(0, 31), 'too short for Solana'],
  ])('rejects %s (%s)', (input) => {
    expect(getAddressKind(input)).toBeNull();
    expect(isValidAddress(input)).toBe(false);
  });
});

describe('normalizeAddress', () => {
  it('lowercases EVM addresses', () => {
    expect(normalizeAddress(VITALIK)).toBe(VITALIK.toLowerCase());
  });

  it('keeps Solana addresses case-sensitive', () => {
    expect(normalizeAddress(` ${SOLANA} `)).toBe(SOLANA);
  });

  it('returns null for invalid input', () => {
    expect(normalizeAddress('hello')).toBeNull();
  });
});

describe('shortenAddress', () => {
  it('keeps the 0x prefix plus four characters on each side', () => {
    expect(shortenAddress('0x12ab34cd56ef7890aabbccddeeff001122334455')).toBe('0x12ab…4455');
  });

  it('shortens Solana addresses without a prefix', () => {
    expect(shortenAddress(SOLANA)).toBe('5tzF…uAi9');
  });

  it('leaves short strings alone', () => {
    expect(shortenAddress('0x12ab89cd')).toBe('0x12ab89cd');
  });
});
