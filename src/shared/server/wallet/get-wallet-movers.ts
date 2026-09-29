import {
  computeTopMovers,
  getContributionUsd,
  isEligibleForMovers,
  isSuspiciousChange,
} from 'shared/lib';
import type { IMovers, Period } from 'shared/types';
import { getZerionClient } from '../zerion';
import { getPositionChanges } from './position-changes';

export const getWalletMovers = async (address: string, period: Period): Promise<IMovers> => {
  const changes = await getPositionChanges(getZerionClient(), address, period);
  const suspicious = changes.filter(
    (change) => isEligibleForMovers(change.position) && isSuspiciousChange(change),
  );

  return {
    period,
    items: computeTopMovers(changes),
    coverage: period === '1d' ? 'all' : 'top-holdings',
    hiddenSuspicious: {
      symbols: [...new Set(suspicious.map(({ position }) => position.asset.symbol))],
      contributionUsd: suspicious.reduce(
        (sum, change) => sum + (getContributionUsd(change) ?? 0),
        0,
      ),
    },
  };
};
