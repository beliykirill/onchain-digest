export type Nullable<T> = T | null;

export const PERIODS = ['1d', '7d'] as const;
export type Period = (typeof PERIODS)[number];

export type BreakdownCoverage = 'all' | 'top-holdings';

export interface IAsset {
  id: string;
  symbol: string;
  name: string;
  iconUrl: Nullable<string>;
  verified: boolean;
}

export interface IChain {
  id: string;
  name: string;
  iconUrl: Nullable<string>;
}

export interface IPositionChange {
  absoluteUsd: number;
  percent: number;
}

export interface IPosition {
  id: string;
  asset: IAsset;
  chain: IChain;
  quantity: number;
  valueUsd: Nullable<number>;
  priceUsd: number;
  change1d: Nullable<IPositionChange>;
}

export interface IWalletSummary {
  address: string;
  period: Period;
  totalValueUsd: number;
  change: {
    absoluteUsd: number;
    percent: Nullable<number>;
  };
  breakdown: {
    marketUsd: number;
    transfersUsd: number;
    coverage: BreakdownCoverage;
  };
  asOf: string;
}

export interface IMover {
  id: string;
  asset: IAsset;
  chain: IChain;
  valueUsd: number;
  contributionUsd: number;
  changePercent: Nullable<number>;
  shareOfChange: number;
}

export interface IMovers {
  period: Period;
  items: IMover[];
  coverage: BreakdownCoverage;
}

export interface IChartPoint {
  timestamp: number;
  valueUsd: number;
}

export interface IBalanceChart {
  period: Period;
  points: IChartPoint[];
  startValueUsd: number;
  endValueUsd: number;
  changeUsd: number;
  changePercent: Nullable<number>;
}

export const ACTIVITY_TYPES = [
  'trade',
  'send',
  'receive',
  'deposit',
  'withdraw',
  'claim',
  'approve',
  'revoke',
  'mint',
  'burn',
  'bid',
  'delegate',
  'revoke_delegation',
  'deploy',
  'execute',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number] | 'unknown';

export type TransferDirection = 'in' | 'out' | 'self';
export type TransactionStatus = 'confirmed' | 'failed' | 'pending';

export interface ITransfer {
  direction: TransferDirection;
  asset: Nullable<IAsset>;
  nftName: Nullable<string>;
  amount: number;
  valueUsd: Nullable<number>;
  sender: Nullable<string>;
  recipient: Nullable<string>;
}

export interface IApproval {
  asset: Nullable<IAsset>;
  amount: number;
  isUnlimited: boolean;
}

export interface IActivityItem {
  id: string;
  hash: string;
  type: ActivityType;
  status: TransactionStatus;
  minedAt: string;
  chain: IChain;
  dapp: Nullable<{ name: string; iconUrl: Nullable<string> }>;
  sentFrom: Nullable<string>;
  sentTo: Nullable<string>;
  transfers: ITransfer[];
  approvals: IApproval[];
  feeUsd: Nullable<number>;
}

export interface IActivity {
  period: Period;
  items: IActivityItem[];
  hiddenDustCount: number;
  hasMore: boolean;
}
