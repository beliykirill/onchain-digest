import type { FC } from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatPercent, formatUsd } from 'shared/lib';
import type { IMover } from 'shared/types';
import { CaptionText } from 'shared/ui/text';
import { TokenIcon } from 'shared/ui/token-icon';
import {
  ContributionText,
  MoverContainer,
  MoverWrapper,
  PercentText,
  ShareIndicator,
  ShareContainer,
  SymbolText,
  TextContainer,
  ValueContainer,
} from './styled';

interface IMoverItemProps {
  mover: IMover;
}

export const MoverItem: FC<IMoverItemProps> = ({ mover }) => {
  const shouldReduceMotion = useReducedMotion();
  const isPositive = mover.contributionUsd > 0;

  return (
    <MoverContainer
      layout={!shouldReduceMotion}
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 6 },
        visible: { opacity: 1, y: 0 },
      }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
    >
      <MoverWrapper>
        <TokenIcon
          symbol={mover.asset.symbol}
          iconUrl={mover.asset.iconUrl}
          chainIconUrl={mover.chain.iconUrl}
          chainName={mover.chain.name}
        />
        <TextContainer>
          <SymbolText $textTheme="semi" title={mover.asset.name}>
            {mover.asset.symbol}
          </SymbolText>
          <CaptionText>
            {mover.chain.name} · {formatUsd(mover.valueUsd)}
          </CaptionText>
        </TextContainer>
        <ValueContainer>
          <ContributionText $textTheme="semi" $isPositive={isPositive}>
            {formatUsd(mover.contributionUsd, { signed: true })}
          </ContributionText>
          {mover.changePercent != null && (
            <PercentText>{formatPercent(mover.changePercent)}</PercentText>
          )}
        </ValueContainer>
      </MoverWrapper>
      <ShareContainer>
        <ShareIndicator
          $isPositive={isPositive}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.max(mover.shareOfChange, 0.02) }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </ShareContainer>
    </MoverContainer>
  );
};
