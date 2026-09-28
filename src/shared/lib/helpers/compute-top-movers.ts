import { MIN_POSITION_VALUE_USD, MOVERS_LIMIT } from 'shared/constants';
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

export const isEligibleForMovers = (position: IPosition, minValueUsd = MIN_POSITION_VALUE_USD) =>
  position.valueUsd != null && position.valueUsd >= minValueUsd;

export const computeTopMovers = (
  changes: IPositionPeriodChange[],
  { limit = MOVERS_LIMIT, minValueUsd = MIN_POSITION_VALUE_USD } = {},
): IMover[] => {
  const candidates = changes.flatMap((change) => {
    if (!isEligibleForMovers(change.position, minValueUsd)) return [];

    const contributionUsd = getContributionUsd(change);

    if (contributionUsd == null || contributionUsd === 0) return [];

    return [{ change, contributionUsd }];
  });

  const totalAbs = candidates.reduce(
    (sum, { contributionUsd }) => sum + Math.abs(contributionUsd),
    0,
  );

  // Ranked by the dollar contribution, not by percentage: a $5 token that gained 80% matters
  // less to the user than $10,000 of ETH that gained 3% ($4 against $300).
  return candidates
    .sort((a, b) => Math.abs(b.contributionUsd) - Math.abs(a.contributionUsd))
    .slice(0, limit)
    .map(({ change, contributionUsd }) => {
      const { position } = change;
      const valueUsd = position.valueUsd ?? 0;
      const startValueUsd = valueUsd - contributionUsd;

      return {
        id: position.id,
        asset: position.asset,
        chain: position.chain,
        valueUsd,
        contributionUsd,
        changePercent:
          change.percent ?? (startValueUsd > 0 ? (contributionUsd / startValueUsd) * 100 : null),
        shareOfChange: totalAbs > 0 ? Math.abs(contributionUsd) / totalAbs : 0,
      };
    });
};
