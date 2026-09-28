import {
  ACTIVITY_TYPES,
  type ActivityType,
  type IActivityItem,
  type IAsset,
  type IChain,
  type IPosition,
  type Nullable,
  type TransactionStatus,
} from 'shared/types';
import type { ZerionChain, ZerionFungibleInfo, ZerionPosition, ZerionTransaction } from './schemas';

export type ChainDirectory = ReadonlyMap<string, IChain>;

export const toChainDirectory = (chains: ZerionChain[]): ChainDirectory =>
  new Map(
    chains.map(({ id, attributes }) => [
      id,
      { id, name: attributes.name, iconUrl: attributes.icon?.url ?? null },
    ]),
  );

export const toChain = (id: string, chains: ChainDirectory): IChain =>
  chains.get(id) ?? {
    id,
    name: id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    iconUrl: null,
  };

export const toAsset = (info: Nullable<ZerionFungibleInfo> | undefined, id: string): IAsset => {
  const symbol = info?.symbol?.trim() || info?.name?.trim() || '???';

  return {
    id: info?.id ?? id,
    symbol,
    name: info?.name?.trim() || symbol,
    iconUrl: info?.icon?.url ?? null,
    verified: info?.flags?.verified ?? false,
  };
};

export const toPosition = (raw: ZerionPosition, chains: ChainDirectory): IPosition => {
  const { attributes, relationships } = raw;
  const { changes } = attributes;

  return {
    id: raw.id,
    asset: toAsset(attributes.fungible_info, relationships.fungible.data.id),
    chain: toChain(relationships.chain.data.id, chains),
    quantity: attributes.quantity.float,
    valueUsd: attributes.value,
    priceUsd: attributes.price ?? 0,
    change1d:
      changes?.absolute_1d != null && changes.percent_1d != null
        ? { absoluteUsd: changes.absolute_1d, percent: changes.percent_1d }
        : null,
  };
};

const toActivityType = (value: string): ActivityType =>
  (ACTIVITY_TYPES as readonly string[]).includes(value) ? (value as ActivityType) : 'unknown';

const toStatus = (value: string): TransactionStatus =>
  value === 'failed' || value === 'pending' ? value : 'confirmed';

export const toActivityItem = (raw: ZerionTransaction, chains: ChainDirectory): IActivityItem => {
  const { attributes, relationships } = raw;
  const dapp = attributes.application_metadata;

  return {
    id: raw.id,
    hash: attributes.hash,
    type: toActivityType(attributes.operation_type),
    status: toStatus(attributes.status),
    minedAt: attributes.mined_at,
    chain: toChain(relationships.chain.data.id, chains),
    dapp: dapp?.name ? { name: dapp.name, iconUrl: dapp.icon?.url ?? null } : null,
    sentFrom: attributes.sent_from ?? null,
    sentTo: attributes.sent_to ?? null,
    transfers: attributes.transfers.map((transfer) => ({
      direction: transfer.direction,
      asset: transfer.fungible_info ? toAsset(transfer.fungible_info, '') : null,
      nftName: transfer.nft_info?.name ?? null,
      amount: transfer.quantity.float,
      valueUsd: transfer.value ?? null,
      sender: transfer.sender ?? null,
      recipient: transfer.recipient ?? null,
    })),
    approvals: attributes.approvals.map((approval) => ({
      asset: approval.fungible_info ? toAsset(approval.fungible_info, '') : null,
      amount: approval.quantity.float,
      isUnlimited: approval.quantity.float >= 1e30,
    })),
    feeUsd: attributes.fee?.value ?? null,
  };
};
