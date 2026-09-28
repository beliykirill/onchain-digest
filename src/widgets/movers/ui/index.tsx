import type { FC } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BlockError } from 'shared/ui/block-error';
import { Skeleton } from 'shared/ui/skeleton';
import { CaptionText, MainText, SectionText } from 'shared/ui/text';
import { useWalletMovers } from '../lib';
import { MoverItem } from './mover-item';
import {
  EmptyContainer,
  HeaderContainer,
  Layout,
  MoversList,
  SkeletonContainer,
  SkeletonWrapper,
} from './styled';

export const Movers: FC = () => {
  const { data, error, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useWalletMovers();

  return (
    <Layout>
      <HeaderContainer>
        <SectionText>Top movers</SectionText>
        <CaptionText>
          {data?.coverage === 'top-holdings'
            ? 'Your 5 largest holdings, by $ impact'
            : 'By $ impact'}
        </CaptionText>
      </HeaderContainer>
      {isPending &&
        [0, 1, 2, 3, 4].map((index) => (
          <SkeletonContainer key={index}>
            <Skeleton $width="36px" $height="36px" $radius="50%" />
            <SkeletonWrapper>
              <Skeleton $width="40%" $height="16px" />
              <Skeleton $width="28%" $height="12px" />
            </SkeletonWrapper>
            <Skeleton $width="72px" $height="16px" />
          </SkeletonContainer>
        ))}
      {isError && !data && (
        <EmptyContainer>
          <BlockError error={error} isRetrying={isFetching} onRetry={() => void refetch()} />
        </EmptyContainer>
      )}
      {data && data.items.length === 0 && (
        <EmptyContainer>
          <MainText $textTheme="semi">No big moves</MainText>
          <CaptionText>
            {data.period === '1d'
              ? 'None of your holdings moved the needle in the last 24 hours.'
              : 'None of your largest holdings moved the needle this week.'}
          </CaptionText>
        </EmptyContainer>
      )}
      {data && data.items.length > 0 && (
        <MoversList
          $isStale={isPlaceholderData}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {data.items.map((mover) => (
              <MoverItem key={mover.id} mover={mover} />
            ))}
          </AnimatePresence>
        </MoversList>
      )}
    </Layout>
  );
};
