import { computeTopMovers } from 'shared/lib';
import type { IMovers, Period } from 'shared/types';
import { getZerionClient } from '../zerion';
import { getPositionChanges } from './position-changes';

export const getWalletMovers = async (address: string, period: Period): Promise<IMovers> => {
  const changes = await getPositionChanges(getZerionClient(), address, period);

  return {
    period,
    items: computeTopMovers(changes),
    coverage: period === '1d' ? 'all' : 'top-holdings',
  };
};
