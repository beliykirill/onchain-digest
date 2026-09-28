import { PALETTE, type PalettePath } from './palette';

export type ColorName =
  | 'surfaceBackground'
  | 'surfaceCard'
  | 'surfaceRaised'
  | 'surfaceStroke'
  | 'surfaceSkeleton'
  | 'textMain'
  | 'textSecondary'
  | 'textMuted'
  | 'textInverted'
  | 'positive'
  | 'negative'
  | 'accent'
  | 'focusRing';

const toVariable = (name: ColorName) =>
  `--color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

const fromPalette = (path: PalettePath) => {
  const [family, step] = path.split('.') as [keyof typeof PALETTE, string];

  return PALETTE[family][Number(step) as keyof (typeof PALETTE)['gray']];
};

const LIGHT: Record<ColorName, PalettePath> = {
  surfaceBackground: 'gray.100',
  surfaceCard: 'gray.50',
  surfaceRaised: 'gray.100',
  surfaceStroke: 'gray.200',
  surfaceSkeleton: 'gray.200',
  textMain: 'gray.950',
  textSecondary: 'gray.700',
  textMuted: 'gray.600',
  textInverted: 'gray.50',
  positive: 'green.700',
  negative: 'red.700',
  accent: 'blue.600',
  focusRing: 'blue.500',
};

const DARK: Record<ColorName, PalettePath> = {
  surfaceBackground: 'gray.1000',
  surfaceCard: 'gray.950',
  surfaceRaised: 'gray.900',
  surfaceStroke: 'gray.800',
  surfaceSkeleton: 'gray.800',
  textMain: 'gray.50',
  textSecondary: 'gray.300',
  textMuted: 'gray.400',
  textInverted: 'gray.1000',
  positive: 'green.400',
  negative: 'red.400',
  accent: 'blue.400',
  focusRing: 'blue.400',
};

export const toColorVariables = (mode: 'light' | 'dark'): string =>
  Object.entries(mode === 'light' ? LIGHT : DARK)
    .map(([name, path]) => `${toVariable(name as ColorName)}: ${fromPalette(path)};`)
    .join('\n');

export const color = (name: ColorName, opacity = 1): string =>
  opacity === 1 ? `rgb(var(${toVariable(name)}))` : `rgb(var(${toVariable(name)}) / ${opacity})`;
