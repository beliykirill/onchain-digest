import { describe, expect, it, vi } from 'vitest';
import { getCacheKey, TtlCache } from './cache';

describe('TtlCache', () => {
  it('shares one in-flight load between concurrent callers', async () => {
    const cache = new TtlCache(1000);
    const load = vi.fn(async () => 42);

    const [a, b] = await Promise.all([cache.getOrLoad('k', load), cache.getOrLoad('k', load)]);

    expect([a, b]).toEqual([42, 42]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('serves from cache until the TTL expires', async () => {
    let now = 0;
    const cache = new TtlCache(1000, () => now);
    const load = vi.fn(async () => now);

    await cache.getOrLoad('k', load);
    now = 999;
    await expect(cache.getOrLoad('k', load)).resolves.toBe(0);
    now = 1001;
    await expect(cache.getOrLoad('k', load)).resolves.toBe(1001);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures', async () => {
    const cache = new TtlCache(1000);
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');

    await expect(cache.getOrLoad('k', load)).rejects.toThrow('boom');
    await expect(cache.getOrLoad('k', load)).resolves.toBe('ok');
  });
});

describe('getCacheKey', () => {
  it('is independent of parameter order', () => {
    expect(getCacheKey('/p', { b: '2', a: '1' })).toBe(getCacheKey('/p', { a: '1', b: '2' }));
  });
});
