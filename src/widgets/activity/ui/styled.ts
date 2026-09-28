import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ifProp, prop } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { cardSurfaceStyle, numericStyle } from 'shared/ui/atoms';
import { Button } from 'shared/ui/button';
import { CaptionText, SecondaryText, SmallText } from 'shared/ui/text';

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

export const CountText = styled(CaptionText)`
  ${numericStyle};
`;

export const ActivityList = styled.ul<{ $isStale: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 340px;
  opacity: ${ifProp('$isStale', 0.55, 1)};
  transition: opacity 0.2s ease;

  ${media(MediaType.MOBILE)} {
    min-height: 0;
  }
`;

export const ActivityContainer = styled(motion.li)<{ $isFailed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 10px 0;
  border-bottom: 1px solid ${color('surfaceStroke', 0.6)};
  opacity: ${ifProp('$isFailed', 0.6, 1)};

  &:last-child {
    border-bottom: 0;
  }
`;

export const ActivityIcon = styled.span<{ $icon: string }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${color('surfaceRaised')};
  color: ${color('textSecondary')};

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    background: currentColor;
    mask: url(${prop('$icon')}) no-repeat center / contain;
  }
`;

export const TextContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const SentenceText = styled(SecondaryText)`
  ${numericStyle};
  color: ${color('textMain')};
  overflow-wrap: anywhere;
`;

export const MetaText = styled(CaptionText)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const FailedBadge = styled(SmallText)`
  padding: 1px 6px;
  border-radius: 6px;
  background: ${color('negative', 0.12)};
  color: ${color('negative')};
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const ToggleButton = styled(Button)`
  margin-right: -8px;
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
  height: 64px;
`;

export const SkeletonWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
`;
