import type { FC } from 'react';
import { PeriodSwitch } from 'features/period-switch';
import { formatPercent, formatUsd } from 'shared/lib';
import { cdnify } from 'shared/lib/themes';
import { AnimatedNumber } from 'shared/ui/animated-number';
import { BlockError } from 'shared/ui/block-error';
import { Skeleton } from 'shared/ui/skeleton';
import { formatAbsUsd, useWalletSummary } from '../lib';
import { AddressCopy } from './address-copy';
import {
  BreakdownText,
  BreakdownValueText,
  ChangeIcon,
  ChangeText,
  Container,
  Layout,
  MetaContainer,
  PercentText,
  SkeletonContainer,
  SummaryText,
} from './styled';

export const Headline: FC = () => {
  const { data, error, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useWalletSummary();

  return (
    <Layout>
      <MetaContainer>
        <AddressCopy />
        <PeriodSwitch />
      </MetaContainer>
      {isPending && (
        <SkeletonContainer>
          <Skeleton $height="48px" $width="min(100%, 720px)" $radius="12px" />
          <Skeleton $height="48px" $width="min(70%, 420px)" $radius="12px" />
          <Skeleton $height="20px" $width="min(90%, 360px)" />
        </SkeletonContainer>
      )}
      {isError && !data && (
        <BlockError error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
      )}
      {data && (
        <Container $isStale={isPlaceholderData}>
          {Math.abs(data.change.absoluteUsd) < 0.01 ? (
            <SummaryText>
              {data.period === '1d'
                ? 'Quiet day. Nothing changed.'
                : 'Quiet week. Nothing changed.'}
            </SummaryText>
          ) : (
            <SummaryText>
              Your wallet is{' '}
              <ChangeText $isPositive={data.change.absoluteUsd > 0}>
                <ChangeIcon
                  $icon={cdnify(
                    data.change.absoluteUsd > 0
                      ? '/static/images/common/trend-up.svg'
                      : '/static/images/common/trend-down.svg',
                  )}
                />
                {data.change.absoluteUsd > 0 ? 'up' : 'down'}{' '}
                <AnimatedNumber value={data.change.absoluteUsd} format={formatAbsUsd} />
                {data.change.percent != null && (
                  <PercentText>
                    (<AnimatedNumber value={data.change.percent} format={formatPercent} />)
                  </PercentText>
                )}
              </ChangeText>{' '}
              {data.period === '1d' ? 'since yesterday' : 'this week'}
            </SummaryText>
          )}
          <BreakdownText>
            {Math.abs(data.change.absoluteUsd) >= 0.01 && (
              <>
                {data.breakdown.coverage === 'all' ? 'Market' : 'Market, top holdings'}{' '}
                <BreakdownValueText $trend={Math.sign(data.breakdown.marketUsd)}>
                  {formatUsd(data.breakdown.marketUsd, { signed: true })}
                </BreakdownValueText>
                {' · '}Net transfers{' '}
                <BreakdownValueText $trend={Math.sign(data.breakdown.transfersUsd)}>
                  {formatUsd(data.breakdown.transfersUsd, { signed: true })}
                </BreakdownValueText>
                {' · '}
              </>
            )}
            Portfolio {formatUsd(data.totalValueUsd)}
          </BreakdownText>
        </Container>
      )}
    </Layout>
  );
};
