import type { IActivity, IBalanceChart, IMovers, IWalletSummary, Period } from 'shared/types';
import { createEndpoint } from '../core';

type WalletRoute = { address: string };
type PeriodParams = { period: Period };

export const walletAPI = {
  getSummary: createEndpoint<IWalletSummary, PeriodParams, WalletRoute>('wallet/{address}/summary'),
  getMovers: createEndpoint<IMovers, PeriodParams, WalletRoute>('wallet/{address}/movers'),
  getChart: createEndpoint<IBalanceChart, PeriodParams, WalletRoute>('wallet/{address}/chart'),
  getActivity: createEndpoint<IActivity, PeriodParams, WalletRoute>('wallet/{address}/activity'),
};
