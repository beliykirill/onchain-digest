import { isBridgeActivity } from 'shared/lib';
import type { ActivityType, IActivityItem } from 'shared/types';

const ICON_BY_TYPE: Partial<Record<ActivityType, string>> = {
  trade: 'swap',
  send: 'send',
  receive: 'receive',
  deposit: 'deposit',
  withdraw: 'withdraw',
  claim: 'claim',
  approve: 'approve',
  revoke: 'revoke',
  mint: 'mint',
  burn: 'burn',
  execute: 'contract',
  deploy: 'contract',
};

export const getActivityIcon = (item: IActivityItem): string =>
  `/static/images/activity/${isBridgeActivity(item) ? 'bridge' : (ICON_BY_TYPE[item.type] ?? 'generic')}.svg`;
