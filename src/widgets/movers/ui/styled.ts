import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ifProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { cardSurfaceStyle, numericStyle } from 'shared/ui/atoms';
import { CaptionText, MainText } from 'shared/ui/text';

export const Layout = styled.section`
  ${cardSurfaceStyle};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
`;

export const MoversList = styled(motion.ul)<{ $isStale: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 340px;
  opacity: ${ifProp('$isStale', 0.55, 1)};
  transition: opacity 0.2s ease;

  ${media(MediaType.MOBILE)} {
    min-height: 0;
  }
`;

export const MoverContainer = styled(motion.li)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  height: 68px;
  border-bottom: 1px solid ${color('surfaceStroke', 0.6)};

  &:last-child {
    border-bottom: 0;
  }
`;

export const MoverWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

export const SymbolText = styled(MainText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
`;

export const ContributionText = styled(MainText)<{ $isPositive: boolean }>`
  ${numericStyle};
  color: ${ifProp('$isPositive', color('positive'), color('negative'))};
`;

export const PercentText = styled(CaptionText)`
  ${numericStyle};
`;

export const ShareContainer = styled.span`
  display: block;
  height: 4px;
  border-radius: 999px;
  background: ${color('surfaceRaised')};
  overflow: hidden;
`;

export const ShareIndicator = styled(motion.span)<{ $isPositive: boolean }>`
  display: block;
  height: 100%;
  border-radius: inherit;
  background: ${ifProp('$isPositive', color('positive', 0.7), color('negative', 0.7))};
  transform-origin: left center;
`;

export const SuspiciousText = styled(CaptionText)<{ $isStale: boolean }>`
  ${numericStyle};
  padding-top: 12px;
  border-top: 1px solid ${color('surfaceStroke', 0.6)};
  opacity: ${ifProp('$isStale', 0.55, 1)};
  transition: opacity 0.2s ease;
`;

export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 340px;

  ${media(MediaType.MOBILE)} {
    min-height: 160px;
  }
`;

export const SkeletonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 68px;
`;

export const SkeletonWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
`;
