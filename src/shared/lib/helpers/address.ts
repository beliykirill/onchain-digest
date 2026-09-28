import type { Nullable } from 'shared/types';

export type AddressKind = 'evm' | 'solana';

export const getAddressKind = (input: string): Nullable<AddressKind> => {
  const value = input.trim();

  if (/^0x[0-9a-fA-F]{40}$/.test(value)) return 'evm';
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) return 'solana';

  return null;
};

export const isValidAddress = (input: string): boolean => getAddressKind(input) !== null;

export const normalizeAddress = (input: string): Nullable<string> => {
  const value = input.trim();
  const kind = getAddressKind(value);

  if (kind === 'evm') return value.toLowerCase();
  if (kind === 'solana') return value;

  return null;
};

export const shortenAddress = (address: string, head = 4, tail = 4): string => {
  const prefix = address.startsWith('0x') ? 2 : 0;

  if (address.length <= prefix + head + tail + 1) return address;

  return `${address.slice(0, prefix + head)}…${address.slice(-tail)}`;
};
