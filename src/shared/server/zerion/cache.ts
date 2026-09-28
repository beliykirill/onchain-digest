interface ICacheEntry {
  value: Promise<unknown>;
  expiresAt: number;
}

export class TtlCache {
  private readonly entries = new Map<string, ICacheEntry>();

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  getOrLoad<T>(key: string, load: () => Promise<T>, ttlMs = this.ttlMs): Promise<T> {
    const existing = this.entries.get(key);

    if (existing && existing.expiresAt > this.now()) return existing.value as Promise<T>;

    const value = load();
    const entry: ICacheEntry = { value, expiresAt: Number.POSITIVE_INFINITY };

    this.entries.set(key, entry);
    value.then(
      () => {
        if (this.entries.get(key) === entry) entry.expiresAt = this.now() + ttlMs;
      },
      () => {
        if (this.entries.get(key) === entry) this.entries.delete(key);
      },
    );

    return value;
  }

  clear() {
    this.entries.clear();
  }
}

export const getCacheKey = (path: string, params: Record<string, string> = {}): string => {
  const query = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return query ? `${path}?${query}` : path;
};
