import { css } from 'styled-components';
import { color, media, MediaType } from 'shared/lib/themes';

export const cardSurfaceStyle = css`
  position: relative;
  background: ${color('surfaceCard')};
  border: 1px solid ${color('surfaceStroke')};
  border-radius: 20px;
  padding: 24px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  ${media(MediaType.MOBILE)} {
    border-radius: 16px;
    padding: 16px;
  }
`;

export const numericStyle = css`
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
`;
