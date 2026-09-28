import styled from 'styled-components';
import { prop, switchProp } from 'styled-tools';
import { color, media, MediaType } from 'shared/lib/themes';

export const ToggleButton = styled.button`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid ${color('surfaceStroke')};
  border-radius: 12px;
  background: ${color('surfaceCard')};
  color: ${color('textSecondary')};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;

  ${media(MediaType.HOVER)} {
    &:hover {
      background: ${color('surfaceRaised')};
      color: ${color('textMain')};
    }
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const ThemeIcon = styled.span<{ $icon: string; $theme: 'light' | 'dark' }>`
  position: absolute;
  width: 18px;
  height: 18px;
  background: currentColor;
  mask: url(${prop('$icon')}) no-repeat center / contain;
  opacity: ${switchProp('$theme', { light: 1, dark: 0 })};
  transform: ${switchProp('$theme', { light: 'none', dark: 'rotate(-90deg) scale(0.6)' })};
  transition:
    opacity 0.2s ease,
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  :root[data-theme='dark'] & {
    opacity: ${switchProp('$theme', { light: 0, dark: 1 })};
    transform: ${switchProp('$theme', { light: 'rotate(90deg) scale(0.6)', dark: 'none' })};
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) & {
      opacity: ${switchProp('$theme', { light: 0, dark: 1 })};
      transform: ${switchProp('$theme', { light: 'rotate(90deg) scale(0.6)', dark: 'none' })};
    }
  }
`;

export const HiddenText = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;
