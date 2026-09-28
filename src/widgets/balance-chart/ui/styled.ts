import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ifProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { cardSurfaceStyle, numericStyle } from 'shared/ui/atoms';
import { CaptionText, MainText, SmallText } from 'shared/ui/text';

export const Layout = styled.section`
  ${cardSurfaceStyle};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
`;

export const RangeText = styled(CaptionText)`
  ${numericStyle};
`;

export const ChartContainer = styled.div<{ $isStale: boolean }>`
  position: relative;
  height: 220px;
  margin: 0 -4px;
  opacity: ${ifProp('$isStale', 0.6, 1)};
  transition: opacity 0.2s ease;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;

  ${media(MediaType.MOBILE)} {
    height: 180px;
  }
`;

export const ChartImage = styled.svg`
  position: absolute;
  inset: 0;
  overflow: visible;
  cursor: crosshair;
`;

export const ChartLine = styled(motion.path)`
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.25s ease;
`;

export const ChartArea = styled(motion.path)`
  transition: fill 0.25s ease;
`;

export const CursorLine = styled.line`
  stroke: ${color('textMuted', 0.5)};
  stroke-width: 1;
  stroke-dasharray: 3 3;
`;

export const CursorDot = styled.circle`
  stroke: ${color('surfaceCard')};
  stroke-width: 2;
`;

export const TooltipContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  background: ${color('surfaceCard')};
  border: 1px solid ${color('surfaceStroke')};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  white-space: nowrap;
  will-change: transform;
`;

export const TooltipValueText = styled(MainText)`
  ${numericStyle};
`;

export const TooltipTimeText = styled(SmallText)`
  ${numericStyle};
`;

export const AxisContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
