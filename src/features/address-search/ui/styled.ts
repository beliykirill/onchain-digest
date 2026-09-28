import { motion } from 'framer-motion';
import styled from 'styled-components';
import { ifProp, prop, switchProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';
import { Button } from 'shared/ui/button';
import { CaptionText, captionTextStyle, type ITextProps, mainTextStyle } from 'shared/ui/text';
import type { AddressSearchType } from './types';

export const Layout = styled.form<{ $type: AddressSearchType }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'input submit'
    'error error'
    'examples examples';
  column-gap: 8px;
  width: 100%;
  max-width: ${switchProp('$type', { hero: '640px', compact: '520px' })};

  ${media(MediaType.MOBILE)} {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'input' 'error' 'submit' 'examples';
  }

  ${ifProp(
    { $type: 'compact' },
    `
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'input' 'error';
    `,
  )};
`;

export const InputWrapper = styled.div<{ $type: AddressSearchType; $hasError: boolean }>`
  grid-area: input;
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  height: ${switchProp('$type', { hero: '56px', compact: '44px' })};
  border-radius: 14px;
  border: 1px solid ${ifProp('$hasError', color('negative'), color('surfaceStroke'))};
  background: ${color('surfaceCard')};
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-within {
    border-color: ${ifProp('$hasError', color('negative'), color('focusRing'))};
    box-shadow: 0 0 0 4px ${ifProp('$hasError', color('negative', 0.14), color('focusRing', 0.18))};
  }
`;

export const LabelText = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

export const TextInput = styled.input<ITextProps>`
  ${mainTextStyle};
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 16px;
  border: 0;
  background: transparent;
  outline: none;
  text-overflow: ellipsis;

  &::placeholder {
    color: ${color('textMuted')};
  }

  &:focus-visible {
    outline: none;
  }
`;

export const PasteButton = styled(Button)`
  min-height: 36px;
  margin-right: 4px;
  padding: 0 10px;
`;

export const ButtonIcon = styled.span<{ $icon: string }>`
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url(${prop('$icon')}) no-repeat center / contain;
`;

export const SubmitButton = styled(Button)`
  grid-area: submit;
  min-height: 56px;
  padding: 0 20px;

  ${media(MediaType.MOBILE)} {
    min-height: 48px;
    margin-top: 12px;
  }
`;

export const ErrorText = styled(motion.p)<ITextProps>`
  ${captionTextStyle};
  grid-area: error;
  margin-top: 8px;
  padding-left: 4px;
  color: ${color('negative')};
`;

export const ExamplesContainer = styled.div`
  grid-area: examples;
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const ExamplesText = styled(CaptionText)`
  margin-right: 4px;
`;

export const ExampleButton = styled(Button)`
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
`;
