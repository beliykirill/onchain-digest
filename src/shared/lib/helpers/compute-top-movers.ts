import { MIN_POSITION_VALUE_USD, MOVERS_LIMIT, SUSPICIOUS_CHANGE_PERCENT } from 'shared/constants';
import type { IMover, IPosition, Nullable } from 'shared/types';

export interface IPositionPeriodChange {
  position: IPosition;
  absoluteUsd?: Nullable<number>;
  percent?: Nullable<number>;
}

export const getContributionUsd = ({
  position,
  absoluteUsd,
  percent,
}: IPositionPeriodChange): Nullable<number> => {
  if (absoluteUsd != null && Number.isFinite(absoluteUsd)) return absoluteUsd;

  const value = position.valueUsd;

  if (value == null || percent == null || !Number.isFinite(percent) || percent <= -100) {
    return null;
  }

  return value - value / (1 + percent / 100);
};

const getChangePercent = (
  { position, percent }: IPositionPeriodChange,
  contributionUsd: number,
): Nullable<number> => {
  const startValueUsd = (position.valueUsd ?? 0) - contributionUsd;

  return percent ?? (startValueUsd > 0 ? (contributionUsd / startValueUsd) * 100 : null);
};

export const isSuspiciousChange = (change: IPositionPeriodChange) => {
  if (change.position.asset.verified) return false;

  const contributionUsd = getContributionUsd(change);

  if (contributionUsd == null || contributionUsd <= 0) return false;

  return (getChangePercent(change, contributionUsd) ?? Infinity) >= SUSPICIOUS_CHANGE_PERCENT;
};

export const isEligibleForMovers = (position: IPosition, minValueUsd = MIN_POSITION_VALUE_USD) =>
  position.valueUsd != null && position.valueUsd >= minValueUsd;

export const computeTopMovers = (
  changes: IPositionPeriodChange[],
  { limit = MOVERS_LIMIT, minValueUsd = MIN_POSITION_VALUE_USD } = {},
): IMover[] => {
  const candidates = changes.flatMap((change) => {
    if (!isEligibleForMovers(change.position, minValueUsd) || isSuspiciousChange(change)) {
      return [];
    }

    const contributionUsd = getContributionUsd(change);

    if (contributionUsd == null || contributionUsd === 0) return [];

    return [{ change, contributionUsd }];
  });

  const totalAbs = candidates.reduce(
    (sum, { contributionUsd }) => sum + Math.abs(contributionUsd),
    0,
  );

  return candidates
    .sort((a, b) => Math.abs(b.contributionUsd) - Math.abs(a.contributionUsd))
    .slice(0, limit)
    .map(({ change, contributionUsd }) => {
      const { position } = change;

      return {
        id: position.id,
        asset: position.asset,
        chain: position.chain,
        valueUsd: position.valueUsd ?? 0,
        contributionUsd,
        changePercent: getChangePercent(change, contributionUsd),
        shareOfChange: totalAbs > 0 ? Math.abs(contributionUsd) / totalAbs : 0,
      };
    });
};
