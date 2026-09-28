import { type FC, useRef } from 'react';
import { formatUsd } from 'shared/lib';
import { useElementSize } from 'shared/lib/hooks';
import { BlockError } from 'shared/ui/block-error';
import { Skeleton } from 'shared/ui/skeleton';
import { CaptionText, SectionText, SmallText } from 'shared/ui/text';
import { useWalletChart } from '../lib';
import { ChartPlot } from './chart-plot';
import {
  AxisContainer,
  ChartContainer,
  EmptyContainer,
  HeaderContainer,
  Layout,
  RangeText,
} from './styled';

export const BalanceChart: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(containerRef);
  const { data, error, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useWalletChart();
  const values = data?.points.map((point) => point.valueUsd) ?? [];
  const hasHistory = values.length >= 2;

  return (
    <Layout>
      <HeaderContainer>
        <SectionText>Balance</SectionText>
        {hasHistory ? (
          <RangeText>
            High {formatUsd(Math.max(...values))} · Low {formatUsd(Math.min(...values))}
          </RangeText>
        ) : (
          isPending && <Skeleton $height="18px" $width="160px" />
        )}
      </HeaderContainer>
      <ChartContainer ref={containerRef} $isStale={isPlaceholderData}>
        {isPending && <Skeleton $height="100%" $radius="12px" />}
        {isError && !data && (
          <BlockError error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
        )}
        {data && !hasHistory && (
          <EmptyContainer>
            <CaptionText>No balance history for this period yet.</CaptionText>
          </EmptyContainer>
        )}
        {data && hasHistory && width > 0 && (
          <ChartPlot
            points={data.points}
            period={data.period}
            width={width}
            height={height}
            trend={data.changeUsd > 0 ? 'up' : data.changeUsd < 0 ? 'down' : 'flat'}
          />
        )}
      </ChartContainer>
      <AxisContainer>
        <SmallText>{(data?.period ?? '1d') === '1d' ? '24h ago' : '7 days ago'}</SmallText>
        <SmallText>Now</SmallText>
      </AxisContainer>
    </Layout>
  );
};
