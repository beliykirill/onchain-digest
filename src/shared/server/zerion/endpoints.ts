import type { ZodType } from 'zod';
import type { IActivityItem, IChartPoint, IPosition, Nullable, Period } from 'shared/types';
import type { IZerionClient } from './client';
import { type ChainDirectory, toActivityItem, toChainDirectory, toPosition } from './mappers';
import {
  chainSchema,
  fungibleChartResponseSchema,
  listResponseSchema,
  portfolioResponseSchema,
  positionSchema,
  transactionSchema,
  walletChartResponseSchema,
} from './schemas';

const CHART_PERIOD: Record<Period, string> = { '1d': 'day', '7d': 'week' };

const parseItems = <T>(items: unknown[], schema: ZodType<T>, label: string): T[] =>
  items.flatMap((item) => {
    const parsed = schema.safeParse(item);

    if (parsed.success) return [parsed.data];

    console.warn(`[zerion] skipped malformed ${label}`, parsed.error.issues[0]);

    return [];
  });

export const fetchChains = async (client: IZerionClient): Promise<ChainDirectory> => {
  const response = await client.get('/chains/', {}, listResponseSchema, 24 * 60 * 60 * 1000);

  return toChainDirectory(parseItems(response.data, chainSchema, 'chain'));
};

export const fetchPortfolio = async (client: IZerionClient, address: string) => {
  const { data } = await client.get(
    `/wallets/${address}/portfolio`,
    { currency: 'usd', 'filter[positions]': 'only_simple' },
    portfolioResponseSchema,
  );

  return {
    totalValueUsd: data.attributes.total.positions,
    change1dUsd: data.attributes.changes?.absolute_1d ?? 0,
    change1dPercent: data.attributes.changes?.percent_1d ?? null,
  };
};

export const fetchPositions = async (
  client: IZerionClient,
  address: string,
): Promise<IPosition[]> => {
  const [response, chains] = await Promise.all([
    client.get(
      `/wallets/${address}/positions/`,
      { currency: 'usd', 'filter[positions]': 'only_simple', 'filter[trash]': 'only_non_trash' },
      listResponseSchema,
    ),
    fetchChains(client),
  ]);

  return parseItems(response.data, positionSchema, 'position')
    .filter((position) => !position.attributes.flags?.is_trash)
    .map((position) => toPosition(position, chains));
};

export const fetchWalletChart = async (
  client: IZerionClient,
  address: string,
  period: Period,
): Promise<IChartPoint[]> => {
  const { data } = await client.get(
    `/wallets/${address}/charts/${CHART_PERIOD[period]}`,
    { currency: 'usd' },
    walletChartResponseSchema,
  );

  return data.attributes.points.map(([seconds, valueUsd]) => ({
    timestamp: seconds * 1000,
    valueUsd,
  }));
};

export const fetchFungibleWeekChangePercent = async (
  client: IZerionClient,
  fungibleId: string,
): Promise<Nullable<number>> => {
  const { data } = await client.get(
    `/fungibles/${encodeURIComponent(fungibleId)}/charts/week`,
    { currency: 'usd' },
    fungibleChartResponseSchema,
  );
  const { points, stats } = data.attributes;
  const first = stats?.first ?? points[0]?.[1];
  const last = stats?.last ?? points.at(-1)?.[1];

  if (first == null || last == null || first <= 0) return null;

  return (last / first - 1) * 100;
};

export const fetchTransactions = async (
  client: IZerionClient,
  address: string,
  sinceMs: number,
): Promise<{ items: IActivityItem[]; hasMore: boolean }> => {
  const cacheFriendlySince = Math.floor(sinceMs / 300_000) * 300_000;
  const [response, chains] = await Promise.all([
    client.get(
      `/wallets/${address}/transactions/`,
      {
        currency: 'usd',
        'page[size]': '100',
        'filter[trash]': 'only_non_trash',
        'filter[min_mined_at]': String(cacheFriendlySince),
      },
      listResponseSchema,
    ),
    fetchChains(client),
  ]);

  return {
    items: parseItems(response.data, transactionSchema, 'transaction')
      .map((transaction) => toActivityItem(transaction, chains))
      .filter((item) => Date.parse(item.minedAt) >= sinceMs),
    hasMore: Boolean(response.links?.next),
  };
};
