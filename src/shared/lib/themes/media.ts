export const BREAKPOINTS = {
  MOBILE: 991,
  SMALL_TABLET: 992,
  TABLET: 1360,
  LAPTOP: 1750,
  DESKTOP: 1920,
  QHD: 2300,
} as const;

export enum MediaType {
  MOBILE = 'MOBILE',
  SMALL_TABLET = 'SMALL_TABLET',
  LAPTOP = 'LAPTOP',
  DESKTOP = 'DESKTOP',
  LARGE_DESKTOP = 'LARGE_DESKTOP',
  QHD = 'QHD',
  HOVER = 'HOVER',
}

type Band = { min?: number; max?: number };

const BANDS: Record<Exclude<MediaType, MediaType.HOVER>, Band> = {
  [MediaType.MOBILE]: { max: BREAKPOINTS.MOBILE },
  [MediaType.SMALL_TABLET]: { min: BREAKPOINTS.SMALL_TABLET, max: BREAKPOINTS.TABLET - 1 },
  [MediaType.LAPTOP]: { min: BREAKPOINTS.TABLET, max: BREAKPOINTS.LAPTOP - 1 },
  [MediaType.DESKTOP]: { min: BREAKPOINTS.LAPTOP, max: BREAKPOINTS.DESKTOP },
  [MediaType.LARGE_DESKTOP]: { min: BREAKPOINTS.DESKTOP + 1 },
  [MediaType.QHD]: { min: BREAKPOINTS.QHD + 1 },
};

const toQuery = ({ min, max }: Band) => {
  const parts = [
    min != null && `(min-width: ${min}px)`,
    max != null && `(max-width: ${max}px)`,
  ].filter(Boolean);

  return parts.length ? `@media ${parts.join(' and ')}` : '@media all';
};

export const media = (type: MediaType | MediaType[]): string => {
  if (!Array.isArray(type)) {
    return type === MediaType.HOVER ? '@media (hover: hover)' : toQuery(BANDS[type]);
  }

  const bands = type
    .filter((t) => t !== MediaType.HOVER)
    .map((t) => BANDS[t as keyof typeof BANDS]);
  const hasOpenMin = bands.some((band) => band.min == null);
  const hasOpenMax = bands.some((band) => band.max == null);

  return toQuery({
    min: hasOpenMin ? undefined : Math.min(...bands.map((band) => band.min!)),
    max: hasOpenMax ? undefined : Math.max(...bands.map((band) => band.max!)),
  });
};
