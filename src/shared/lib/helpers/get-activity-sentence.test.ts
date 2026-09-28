import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { toActivityItem, toChainDirectory } from 'shared/server/zerion/mappers';
import { chainSchema, transactionSchema } from 'shared/server/zerion/schemas';
import type { ActivityType, IActivityItem, IAsset, ITransfer } from 'shared/types';
import { getActivitySentence } from './get-activity-sentence';

const asset = (symbol: string): IAsset => ({
  id: symbol.toLowerCase(),
  symbol,
  name: symbol,
  iconUrl: null,
  verified: true,
});

const transfer = (
  direction: ITransfer['direction'],
  amount: number,
  symbol: string,
  extra: Partial<ITransfer> = {},
): ITransfer => ({
  direction,
  asset: asset(symbol),
  nftName: null,
  amount,
  valueUsd: null,
  sender: '0x1111111111111111111111111111111111111111',
  recipient: '0x2222222222222222222222222222222222222222',
  ...extra,
});

const item = (type: ActivityType, overrides: Partial<IActivityItem> = {}): IActivityItem => ({
  id: 'tx',
  hash: '0xhash',
  type,
  status: 'confirmed',
  minedAt: '2026-09-28T10:00:00Z',
  chain: { id: 'ethereum', name: 'Ethereum', iconUrl: null },
  dapp: null,
  sentFrom: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  sentTo: '0x12ab34cd56ef7890aabbccddeeff00112233c89d',
  transfers: [],
  approvals: [],
  feeUsd: null,
  ...overrides,
});

const uniswap = { name: 'Uniswap', iconUrl: null };

describe('getActivitySentence', () => {
  it('describes a swap with the dapp', () => {
    const sentence = getActivitySentence(
      item('trade', {
        dapp: uniswap,
        transfers: [transfer('out', 0.5, 'ETH'), transfer('in', 1_200, 'USDC')],
      }),
    );

    expect(sentence).toBe('Swapped 0.5 ETH → 1,200 USDC on Uniswap');
  });

  it('ignores self transfers inside a swap and works without a dapp', () => {
    const sentence = getActivitySentence(
      item('trade', {
        transfers: [
          transfer('in', 0.01, 'cirBTC'),
          transfer('self', 1, 'USDC'),
          transfer('out', 1, 'USDC'),
        ],
      }),
    );

    expect(sentence).toBe('Swapped 1 USDC → 0.01 cirBTC');
  });

  it('describes a send with a shortened recipient', () => {
    const sentence = getActivitySentence(
      item('send', {
        transfers: [
          transfer('out', 100, 'USDC', { recipient: '0x12ab34cd56ef7890aabbccddeeff0011223389cd' }),
        ],
      }),
    );

    expect(sentence).toBe('Sent 100 USDC to 0x12ab…89cd');
  });

  it('describes a receive with a shortened sender', () => {
    const sentence = getActivitySentence(
      item('receive', {
        transfers: [
          transfer('in', 0.2, 'ETH', { sender: '0x12ab34cd56ef7890aabbccddeeff0011223389cd' }),
        ],
      }),
    );

    expect(sentence).toBe('Received 0.2 ETH from 0x12ab…89cd');
  });

  it('summarises multi-asset transfers', () => {
    const sentence = getActivitySentence(
      item('receive', {
        transfers: [transfer('in', 1, 'ETH'), transfer('in', 2, 'USDC'), transfer('in', 3, 'DAI')],
      }),
    );

    expect(sentence).toBe('Received 1 ETH + 2 more from 0x1111…1111');
  });

  it('names NFTs instead of quantities', () => {
    const sentence = getActivitySentence(
      item('receive', {
        transfers: [transfer('in', 1, 'BOMB', { asset: null, nftName: 'Bomb #23909' })],
      }),
    );

    expect(sentence).toBe('Received Bomb #23909 from 0x1111…1111');
  });

  it('describes deposits and withdrawals as staking or lending', () => {
    const lido = { name: 'Lido', iconUrl: null };

    expect(
      getActivitySentence(item('deposit', { dapp: lido, transfers: [transfer('out', 1, 'ETH')] })),
    ).toBe('Deposited 1 ETH into Lido');
    expect(
      getActivitySentence(
        item('withdraw', {
          dapp: { name: 'Aave', iconUrl: null },
          transfers: [transfer('in', 1, 'ETH')],
        }),
      ),
    ).toBe('Withdrew 1 ETH from Aave');
    expect(getActivitySentence(item('deposit'))).toBe('Deposited assets into a protocol');
  });

  it('describes a claim', () => {
    expect(
      getActivitySentence(
        item('claim', {
          dapp: { name: 'Arbitrum', iconUrl: null },
          transfers: [transfer('in', 12, 'ARB')],
        }),
      ),
    ).toBe('Claimed 12 ARB from Arbitrum');
  });

  it('describes limited and unlimited approvals', () => {
    expect(
      getActivitySentence(
        item('approve', {
          dapp: uniswap,
          approvals: [{ asset: asset('USDC'), amount: 1.157e59, isUnlimited: true }],
        }),
      ),
    ).toBe('Approved unlimited USDC for Uniswap');
    expect(
      getActivitySentence(
        item('approve', { approvals: [{ asset: asset('USDC'), amount: 100, isUnlimited: false }] }),
      ),
    ).toBe('Approved 100 USDC for 0x12ab…c89d');
  });

  it('describes a revoke', () => {
    expect(
      getActivitySentence(
        item('revoke', {
          dapp: uniswap,
          approvals: [{ asset: asset('USDC'), amount: 0, isUnlimited: false }],
        }),
      ),
    ).toBe('Revoked USDC approval for Uniswap');
  });

  it('describes mint and burn', () => {
    expect(getActivitySentence(item('mint', { transfers: [transfer('in', 1, 'LP')] }))).toBe(
      'Minted 1 LP',
    );
    expect(getActivitySentence(item('burn', { transfers: [transfer('out', 7, 'BOMB')] }))).toBe(
      'Burned 7 BOMB',
    );
  });

  it('detects bridges by dapp name', () => {
    expect(
      getActivitySentence(
        item('send', {
          dapp: { name: 'Across Protocol', iconUrl: null },
          transfers: [transfer('out', 1, 'ETH')],
        }),
      ),
    ).toBe('Bridged 1 ETH via Across Protocol');
  });

  it('describes generic contract calls', () => {
    expect(getActivitySentence(item('execute', { dapp: { name: 'ENS', iconUrl: null } }))).toBe(
      'Interacted with ENS',
    );
    expect(getActivitySentence(item('execute'))).toBe('Contract interaction on Ethereum');
  });

  it.each([
    ['bid', 'Placed a bid'],
    ['delegate', 'Delegated votes'],
    ['revoke_delegation', 'Revoked a delegation'],
    ['deploy', 'Deployed a contract on Ethereum'],
  ] as const)('describes %s', (type, expected) => {
    expect(getActivitySentence(item(type))).toBe(expected);
  });

  it('falls back to a neutral sentence for unknown types', () => {
    expect(getActivitySentence(item('unknown'))).toBe('Transaction on Ethereum');
  });

  it('never breaks on missing transfers', () => {
    expect(getActivitySentence(item('send', { sentTo: null }))).toBe('Sent tokens');
    expect(getActivitySentence(item('trade'))).toBe('Swapped tokens');
  });

  it('produces clean sentences for every recorded fixture transaction', () => {
    const dataDir = path.resolve(import.meta.dirname, '../../server/fixtures/data');
    const read = (file: string) =>
      JSON.parse(readFileSync(path.join(dataDir, file), 'utf8')) as { data: unknown[] };
    const chains = toChainDirectory(read('chains.json').data.map((c) => chainSchema.parse(c)));
    const sentences = ['up', 'down', 'active', 'quiet', 'vitalik'].flatMap((wallet) =>
      read(`${wallet}/transactions.json`).data.map((raw) =>
        getActivitySentence(toActivityItem(transactionSchema.parse(raw), chains)),
      ),
    );

    expect(sentences.length).toBeGreaterThan(50);
    sentences.forEach((sentence) => {
      expect(sentence).not.toMatch(/undefined|null|NaN|\s{2}/);
      expect(sentence.length).toBeGreaterThan(5);
    });
  });
});
