import styled, { css } from 'styled-components';
import { switchProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import type { TextTheme } from './types';

export interface ITextProps {
  $textTheme?: TextTheme;
}

export const headlineTextStyle = css`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 44px;
  line-height: 52px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: ${color('textMain')};

  ${media([MediaType.SMALL_TABLET, MediaType.LAPTOP])} {
    font-size: 40px;
    line-height: 48px;
  }

  ${media(MediaType.MOBILE)} {
    font-size: 30px;
    line-height: 38px;
  }
`;

export const sectionTextStyle = css`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${color('textMain')};

  ${media(MediaType.MOBILE)} {
    font-size: 16px;
    line-height: 22px;
  }
`;

export const mainTextStyle = css<ITextProps>`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: ${switchProp('$textTheme', { regular: 400, medium: 500, semi: 600, bold: 700 }, 400)};
  color: ${color('textMain')};
`;

export const secondaryTextStyle = css<ITextProps>`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 15px;
  line-height: 22px;
  font-weight: ${switchProp('$textTheme', { regular: 400, medium: 500, semi: 600, bold: 700 }, 400)};
  color: ${color('textSecondary')};

  ${media(MediaType.MOBILE)} {
    font-size: 14px;
    line-height: 20px;
  }
`;

export const captionTextStyle = css<ITextProps>`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: ${switchProp('$textTheme', { regular: 400, medium: 500, semi: 600, bold: 700 }, 400)};
  color: ${color('textMuted')};
`;

export const smallTextStyle = css<ITextProps>`
  margin: 0;
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: ${switchProp('$textTheme', { regular: 400, medium: 500, semi: 600, bold: 700 }, 400)};
  color: ${color('textMuted')};
`;

export const HeadlineText = styled.h1`
  ${headlineTextStyle};
`;

export const SectionText = styled.h2`
  ${sectionTextStyle};
`;

export const MainText = styled.p<ITextProps>`
  ${mainTextStyle};
`;

export const SecondaryText = styled.p<ITextProps>`
  ${secondaryTextStyle};
`;

export const CaptionText = styled.p<ITextProps>`
  ${captionTextStyle};
`;

export const SmallText = styled.p<ITextProps>`
  ${smallTextStyle};
`;
