import { MIN_POSITION_VALUE_USD } from 'shared/constants';
import type { IActivity, IActivityItem, Period } from 'shared/types';
import { fetchTransactions, getZerionClient } from '../zerion';

const PERIOD_MS: Record<Period, number> = {
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

const isIncomingDust = ({ type, transfers }: IActivityItem) =>
  type === 'receive' &&
  transfers.every(
    ({ direction, valueUsd }) =>
      direction !== 'out' && (valueUsd == null || valueUsd < MIN_POSITION_VALUE_USD),
  );

export const getWalletActivity = async (address: string, period: Period): Promise<IActivity> => {
  const { items, hasMore } = await fetchTransactions(
    getZerionClient(),
    address,
    Date.now() - PERIOD_MS[period],
  );
  const visible = items.filter((item) => !isIncomingDust(item));

  return {
    period,
    items: visible,
    hiddenDustCount: items.length - visible.length,
    hasMore,
  };
};
