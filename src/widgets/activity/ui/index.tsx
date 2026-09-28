import { type FC, useState } from 'react';
import { BlockError } from 'shared/ui/block-error';
import { Skeleton } from 'shared/ui/skeleton';
import { CaptionText, MainText, SectionText } from 'shared/ui/text';
import { useWalletActivity } from '../lib';
import { ActivityItem } from './activity-item';
import {
  ActivityList,
  CountText,
  EmptyContainer,
  FooterContainer,
  HeaderContainer,
  Layout,
  SkeletonContainer,
  SkeletonWrapper,
  ToggleButton,
} from './styled';

export const Activity: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, error, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useWalletActivity();
  const items = data?.items ?? [];

  return (
    <Layout>
      <HeaderContainer>
        <SectionText>What you did</SectionText>
        {data && items.length > 0 && (
          <CountText>
            {items.length}
            {data.hasMore ? '+' : ''} {items.length === 1 ? 'transaction' : 'transactions'}
          </CountText>
        )}
      </HeaderContainer>
      {isPending &&
        [0, 1, 2, 3, 4].map((index) => (
          <SkeletonContainer key={index}>
            <Skeleton $width="36px" $height="36px" $radius="50%" />
            <SkeletonWrapper>
              <Skeleton $width="75%" $height="16px" />
              <Skeleton $width="30%" $height="12px" />
            </SkeletonWrapper>
          </SkeletonContainer>
        ))}
      {isError && !data && (
        <EmptyContainer>
          <BlockError error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
        </EmptyContainer>
      )}
      {data && items.length === 0 && (
        <EmptyContainer>
          <MainText $textTheme="semi">
            No transactions in {data.period === '7d' ? 'the last 7 days' : 'the last 24 hours'}.
          </MainText>
          <CaptionText>
            {data.hiddenDustCount > 0
              ? `We hid ${data.hiddenDustCount === 1 ? 'an incoming dust transfer that looks' : `${data.hiddenDustCount} incoming dust transfers that look`} like spam.`
              : 'When this wallet swaps, sends or receives something, it will show up here.'}
          </CaptionText>
        </EmptyContainer>
      )}
      {data && items.length > 0 && (
        <>
          <ActivityList $isStale={isPlaceholderData}>
            {(isExpanded ? items : items.slice(0, 8)).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </ActivityList>
          <FooterContainer>
            <CaptionText>
              {[
                data.hiddenDustCount > 0 &&
                  `${data.hiddenDustCount} dust ${data.hiddenDustCount === 1 ? 'transfer' : 'transfers'} hidden`,
                data.hasMore && `Showing the latest ${items.length}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </CaptionText>
            {items.length > 8 && (
              <ToggleButton
                type="button"
                $type="ghost"
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? 'Show less' : `Show all (${items.length})`}
              </ToggleButton>
            )}
          </FooterContainer>
        </>
      )}
    </Layout>
  );
};
