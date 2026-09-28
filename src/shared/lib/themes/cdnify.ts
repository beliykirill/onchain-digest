export const cdnify = (path: string): string =>
  `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}${path}`;
