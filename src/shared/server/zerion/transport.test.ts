import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors';
import { createHttpTransport } from './transport';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

const setup = (responses: Response[]) => {
  const fetchImpl = vi.fn<typeof fetch>();

  responses.forEach((response) => fetchImpl.mockResolvedValueOnce(response));

  const wait = vi.fn<(ms: number) => Promise<void>>(async () => {});
  const throttle = vi.fn(async () => {});
  const transport = createHttpTransport({
    apiKey: 'test-key',
    timeoutMs: 1000,
    throttle,
    fetchImpl,
    wait,
  });

  return { transport, fetchImpl, wait, throttle };
};

const throttled = {
  errors: [{ title: 'Too many requests', detail: 'Your request had been throttled' }],
};

describe('createHttpTransport', () => {
  it('sends Basic auth with the key as username and an empty password', async () => {
    const { transport, fetchImpl } = setup([json(200, { data: [] })]);

    await transport({ path: '/chains/', params: { currency: 'usd' } });

    const [url, init] = fetchImpl.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;

    expect(String(url)).toBe('https://api.zerion.io/v1/chains/?currency=usd');
    expect(headers.Authorization).toBe(`Basic ${Buffer.from('test-key:').toString('base64')}`);
    expect(headers['User-Agent']).toBeTruthy();
  });

  it('retries a 429 up to two times, waiting at least the reset or the backoff', async () => {
    const reset = { 'ratelimit-org-second-reset': '1', 'ratelimit-org-day-remaining': '200' };
    const { transport, fetchImpl, wait, throttle } = setup([
      json(429, throttled, reset),
      json(429, throttled, reset),
      json(200, { ok: true }),
    ]);

    await expect(transport({ path: '/x' })).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(throttle).toHaveBeenCalledTimes(3);
    expect(wait.mock.calls.map(([ms]) => ms)).toEqual([1000, 2000]);
  });

  it('gives up after two retries with RATE_LIMITED', async () => {
    const { transport, fetchImpl } = setup([
      json(429, throttled),
      json(429, throttled),
      json(429, throttled),
    ]);

    await expect(transport({ path: '/x' })).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('does not retry when the daily quota is exhausted', async () => {
    const { transport, fetchImpl } = setup([
      json(429, throttled, {
        'ratelimit-org-day-remaining': '0',
        'ratelimit-org-day-reset': '3600',
      }),
    ]);

    await expect(transport({ path: '/x' })).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      retryAfterSeconds: 3600,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('honours Retry-After on 503 while the wallet is being indexed', async () => {
    const { transport, wait } = setup([
      json(503, {}, { 'retry-after': '2' }),
      json(200, { ok: true }),
    ]);

    await expect(transport({ path: '/x' })).resolves.toEqual({ ok: true });
    expect(wait).toHaveBeenCalledWith(2000);
  });

  it('maps a 400 about the address to INVALID_ADDRESS without retrying', async () => {
    const { transport, fetchImpl } = setup([
      json(400, {
        errors: [
          { title: 'Malformed parameter was sent', detail: 'wallet address x must be valid' },
        ],
      }),
    ]);

    await expect(transport({ path: '/x' })).rejects.toMatchObject({ code: 'INVALID_ADDRESS' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('refuses to call the API without a key', async () => {
    const transport = createHttpTransport({
      apiKey: undefined,
      timeoutMs: 1000,
      throttle: async () => {},
    });

    await expect(transport({ path: '/x' })).rejects.toBeInstanceOf(AppError);
  });
});
