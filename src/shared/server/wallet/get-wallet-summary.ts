import { getContributionUsd, isSuspiciousChange } from 'shared/lib';
import type { IWalletSummary, Period } from 'shared/types';
import { fetchPortfolio, fetchWalletChart, getZerionClient } from '../zerion';
import { getPositionChanges } from './position-changes';

export const getWalletSummary = async (
  address: string,
  period: Period,
): Promise<IWalletSummary> => {
  const client = getZerionClient();
  const [portfolio, positionChanges, points] = await Promise.all([
    fetchPortfolio(client, address),
    getPositionChanges(client, address, period),
    period === '7d' ? fetchWalletChart(client, address, period) : Promise.resolve([]),
  ]);

  let marketUsd = 0;
  let suspiciousUsd = 0;

  for (const change of positionChanges) {
    const contributionUsd = getContributionUsd(change) ?? 0;

    if (isSuspiciousChange(change)) suspiciousUsd += contributionUsd;
    else marketUsd += contributionUsd;
  }

  let absoluteUsd = portfolio.change1dUsd;
  let percent = portfolio.change1dPercent;

  if (period === '7d') {
    const start = points[0]?.valueUsd ?? portfolio.totalValueUsd;
    const end = points.at(-1)?.valueUsd ?? portfolio.totalValueUsd;

    absoluteUsd = end - start;
    percent = start > 0 ? (absoluteUsd / start) * 100 : null;
  }

  return {
    address,
    period,
    totalValueUsd: portfolio.totalValueUsd,
    change: { absoluteUsd, percent },
    breakdown: {
      marketUsd,
      transfersUsd: absoluteUsd - marketUsd - suspiciousUsd,
      suspiciousUsd,
      coverage: period === '1d' ? 'all' : 'top-holdings',
    },
    asOf: new Date().toISOString(),
  };
};
