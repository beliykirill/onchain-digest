import { isValidAddress } from 'shared/lib';
import type { Nullable } from 'shared/types';

export const getAddressError = (value: string): Nullable<string> => {
  const input = value.trim();

  if (!input) return 'Paste a wallet address first.';
  if (/\.(eth|sol)$/i.test(input)) return 'Names aren’t supported yet. Paste the address itself.';
  if (isValidAddress(input)) return null;
  if (input.startsWith('0x')) return 'An EVM address is 0x followed by 40 hex characters.';

  return 'That doesn’t look like an EVM or Solana address.';
};
