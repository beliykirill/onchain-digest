import type { FC } from 'react';
import { ApiError } from 'shared/lib/api';
import { Button } from 'shared/ui/button';
import { MainText } from 'shared/ui/text';
import { ErrorContainer, ErrorText } from './styled';

interface BlockErrorProps {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}

export const BlockError: FC<BlockErrorProps> = ({ error, isRetrying, onRetry }) => {
  return (
    <ErrorContainer>
      <MainText $textTheme="semi">
        {error instanceof ApiError && error.code === 'RATE_LIMITED'
          ? 'Slow down a little'
          : 'Couldn’t load this block'}
      </MainText>
      <ErrorText>
        {error instanceof ApiError
          ? error.message
          : 'Something went wrong while loading this block.'}
      </ErrorText>
      <Button type="button" $type="secondary" disabled={isRetrying} onClick={onRetry}>
        {isRetrying ? 'Retrying…' : 'Retry'}
      </Button>
    </ErrorContainer>
  );
};
