import { createGlobalStyle } from 'styled-components';
import { color, toColorVariables } from 'shared/lib/themes';

export const GlobalStyle = createGlobalStyle`
  :root {
    ${toColorVariables('light')}
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      ${toColorVariables('dark')}
      color-scheme: dark;
    }
  }

  :root[data-theme='dark'] {
    ${toColorVariables('dark')}
    color-scheme: dark;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: ${color('surfaceBackground')};
    color: ${color('textMain')};
    transition: background-color 0.2s ease;
  }

  button,
  input {
    font: inherit;
    color: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  img,
  svg {
    display: block;
  }

  ul,
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :focus-visible {
    outline: 2px solid ${color('focusRing')};
    outline-offset: 2px;
  }

  ::selection {
    background: ${color('accent', 0.25)};
  }

  @media (prefers-reduced-motion: reduce), (scripting: none) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
