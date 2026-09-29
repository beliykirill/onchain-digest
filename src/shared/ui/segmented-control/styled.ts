import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ifProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { captionTextStyle, type TextProps } from 'shared/ui/text';

export const Layout = styled.div`
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  border-radius: 12px;
  background: ${color('surfaceRaised')};
  border: 1px solid ${color('surfaceStroke')};
`;

export const SegmentButton = styled.button.attrs<TextProps>({ $textTheme: 'semi' })<
  TextProps & { $isActive: boolean }
>`
  ${captionTextStyle};
  position: relative;
  min-width: 56px;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: ${ifProp('$isActive', color('textMain'), color('textSecondary'))};
  cursor: pointer;
  transition: color 0.2s ease;

  ${media(MediaType.HOVER)} {
    &:hover {
      color: ${color('textMain')};
    }
  }

  &:focus-visible {
    outline-offset: -2px;
  }
`;

export const SegmentIndicator = styled(motion.span)`
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: 9px;
  background: ${color('surfaceElevated')};
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 0 0 1px ${color('surfaceStroke')};
`;

export const SegmentText = styled.span`
  position: relative;
  z-index: 1;
`;
