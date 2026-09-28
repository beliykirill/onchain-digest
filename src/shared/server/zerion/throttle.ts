export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const createThrottle = (intervalMs: number, now: () => number = Date.now) => {
  let nextSlot = 0;

  return async (): Promise<void> => {
    const current = now();
    const slot = Math.max(current, nextSlot);

    nextSlot = slot + intervalMs;

    if (slot > current) await sleep(slot - current);
  };
};

export type Throttle = ReturnType<typeof createThrottle>;
