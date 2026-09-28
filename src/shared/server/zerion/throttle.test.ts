import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createThrottle } from './throttle';

describe('createThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('spaces calls at least one interval apart, in FIFO order', async () => {
    const acquire = createThrottle(1000);
    const started: number[] = [];

    const calls = [0, 1, 2].map((id) => acquire().then(() => started.push(id)));

    await vi.advanceTimersByTimeAsync(0);
    expect(started).toEqual([0]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(started).toEqual([0, 1]);
    await vi.advanceTimersByTimeAsync(1000);
    await Promise.all(calls);
    expect(started).toEqual([0, 1, 2]);
  });

  it('does not delay a call after an idle period', async () => {
    const acquire = createThrottle(1000);

    await acquire();
    await vi.advanceTimersByTimeAsync(5000);

    let done = false;

    void acquire().then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(true);
  });
});
