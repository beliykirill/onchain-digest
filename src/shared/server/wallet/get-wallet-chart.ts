import type { IBalanceChart, Period } from 'shared/types';
import { fetchWalletChart, getZerionClient } from '../zerion';

export const getWalletChart = async (address: string, period: Period): Promise<IBalanceChart> => {
  const now = Date.now();
  const points = (await fetchWalletChart(getZerionClient(), address, period)).map((point) => ({
    ...point,
    timestamp: Math.min(point.timestamp, now),
  }));
  const startValueUsd = points[0]?.valueUsd ?? 0;
  const endValueUsd = points.at(-1)?.valueUsd ?? 0;
  const changeUsd = endValueUsd - startValueUsd;

  return {
    period,
    points,
    startValueUsd,
    endValueUsd,
    changeUsd,
    changePercent: startValueUsd > 0 ? (changeUsd / startValueUsd) * 100 : null,
  };
};
