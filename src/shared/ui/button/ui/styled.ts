import styled from 'styled-components';
import { switchProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { captionTextStyle, type ITextProps } from 'shared/ui/text';
import type { ButtonType } from './types';

export const Button = styled.button.attrs<ITextProps>({ $textTheme: 'semi' })<
  ITextProps & { $type?: ButtonType }
>`
  ${captionTextStyle};
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease,
    opacity 0.15s ease;

  ${switchProp(
    '$type',
    {
      primary: `
      background: ${color('textMain')};
      color: ${color('textInverted')};
    `,
      secondary: `
      background: ${color('surfaceCard')};
      border-color: ${color('surfaceStroke')};
      color: ${color('textMain')};
    `,
      ghost: `
      background: transparent;
      color: ${color('textSecondary')};
    `,
    },
    `
    background: ${color('surfaceCard')};
    border-color: ${color('surfaceStroke')};
    color: ${color('textMain')};
  `,
  )};

  ${media(MediaType.HOVER)} {
    &:hover:not(:disabled) {
      ${switchProp(
        '$type',
        {
          primary: `opacity: 0.88;`,
          ghost: `background: ${color('surfaceRaised')}; color: ${color('textMain')};`,
        },
        `background: ${color('surfaceRaised')};`,
      )};
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;
