import { MOVERS_LIMIT } from 'shared/constants';
import { type IPositionPeriodChange, isEligibleForMovers } from 'shared/lib';
import type { IPosition, Period } from 'shared/types';
import { fetchFungibleWeekPrices, fetchPositions, type IZerionClient } from '../zerion';

export const getPositionChanges = async (
  client: IZerionClient,
  address: string,
  period: Period,
): Promise<IPositionPeriodChange[]> => {
  const positions = await fetchPositions(client, address);

  if (period === '1d') {
    return positions.map((position) => ({
      position,
      absoluteUsd: position.change1d?.absoluteUsd ?? null,
      percent: position.change1d?.percent ?? null,
    }));
  }

  const largest = positions
    .filter((position) => position.change1d && isEligibleForMovers(position))
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
  const byFungible = new Map<string, IPosition[]>();

  for (const position of largest) {
    if (byFungible.size >= MOVERS_LIMIT && !byFungible.has(position.asset.id)) continue;
    byFungible.set(position.asset.id, [...(byFungible.get(position.asset.id) ?? []), position]);
  }

  const changes = await Promise.all(
    [...byFungible].map(async ([fungibleId, group]) => {
      const prices = await fetchFungibleWeekPrices(client, fungibleId).catch(() => null);

      return group.map((position) => {
        if (prices && prices.first === 0 && prices.last > 0) {
          return { position, absoluteUsd: position.valueUsd, percent: null };
        }

        return {
          position,
          percent: prices && prices.first > 0 ? (prices.last / prices.first - 1) * 100 : null,
        };
      });
    }),
  );

  return changes.flat();
};
