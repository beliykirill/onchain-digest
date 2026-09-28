import type { FC } from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatRelativeTime, getActivitySentence } from 'shared/lib';
import { cdnify } from 'shared/lib/themes';
import type { IActivityItem } from 'shared/types';
import { getActivityIcon } from '../lib';
import {
  ActivityContainer,
  ActivityIcon,
  FailedBadge,
  MetaText,
  SentenceText,
  TextContainer,
} from './styled';

interface IActivityItemProps {
  item: IActivityItem;
}

export const ActivityItem: FC<IActivityItemProps> = ({ item }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ActivityContainer
      $isFailed={item.status === 'failed'}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <ActivityIcon $icon={cdnify(getActivityIcon(item))} />
      <TextContainer>
        <SentenceText>{getActivitySentence(item)}</SentenceText>
        <MetaText as="div">
          {item.status === 'failed' && <FailedBadge as="span">Failed</FailedBadge>}
          {item.status === 'pending' && <span>Pending ·</span>}
          <time dateTime={item.minedAt} title={new Date(item.minedAt).toLocaleString('en-US')}>
            {formatRelativeTime(item.minedAt)}
          </time>
          <span>· {item.chain.name}</span>
        </MetaText>
      </TextContainer>
    </ActivityContainer>
  );
};
