import type { ZodType } from 'zod';
import { getServerEnv } from '../env';
import { AppError } from '../errors';
import { mockTransport } from '../fixtures';
import { getCacheKey, TtlCache } from './cache';
import { createThrottle } from './throttle';
import { createHttpTransport, type ZerionTransport } from './transport';

export interface IZerionClient {
  get<T>(
    path: string,
    params: Record<string, string>,
    schema: ZodType<T>,
    ttlMs?: number,
  ): Promise<T>;
}

export const createZerionClient = (transport: ZerionTransport, cache: TtlCache): IZerionClient => ({
  get: (path, params, schema, ttlMs) =>
    cache.getOrLoad(
      getCacheKey(path, params),
      async () => {
        const parsed = schema.safeParse(await transport({ path, params }));

        if (!parsed.success) {
          throw new AppError('UPSTREAM_ERROR', {
            message: 'The data provider returned an unexpected response.',
            cause: parsed.error,
          });
        }

        return parsed.data;
      },
      ttlMs,
    ),
});

const globalForZerion = globalThis as typeof globalThis & { zerionClient?: IZerionClient };

export const getZerionClient = (): IZerionClient => {
  if (!globalForZerion.zerionClient) {
    const env = getServerEnv();
    const transport = env.useMocks
      ? mockTransport
      : createHttpTransport({
          apiKey: env.zerionApiKey,
          timeoutMs: env.requestTimeoutMs,
          throttle: createThrottle(Math.ceil(1000 / env.requestsPerSecond) + 50),
        });

    globalForZerion.zerionClient = createZerionClient(transport, new TtlCache(env.cacheTtlMs));
  }

  return globalForZerion.zerionClient;
};
