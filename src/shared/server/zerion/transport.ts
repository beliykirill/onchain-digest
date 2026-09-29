import { AppError } from '../errors';
import { sleep, type Throttle } from './throttle';

export interface IZerionRequest {
  path: string;
  params?: Record<string, string>;
}

export type ZerionTransport = (request: IZerionRequest) => Promise<unknown>;

interface IHttpTransportOptions {
  apiKey: string | undefined;
  timeoutMs: number;
  throttle: Throttle;
  fetchImpl?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
}

const readSeconds = (response: Response, header: string): number | undefined => {
  const value = Number(response.headers.get(header));

  return Number.isFinite(value) && value > 0 ? value : undefined;
};

const readErrorDetail = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { errors?: { detail?: string }[] };

    return body.errors?.[0]?.detail ?? '';
  } catch {
    return '';
  }
};

const isTimeout = (error: unknown) =>
  error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');

export const createHttpTransport = ({
  apiKey,
  timeoutMs,
  throttle,
  fetchImpl = fetch,
  wait = sleep,
}: IHttpTransportOptions): ZerionTransport => {
  const authorization = apiKey ? `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}` : null;

  return async ({ path, params = {} }) => {
    if (!authorization) {
      throw new AppError('UNAUTHORIZED', {
        detail: 'ZERION_API_KEY is not set. Add it to .env.local or run with USE_MOCKS=true.',
      });
    }

    const url = new URL(`https://api.zerion.io/v1${path}`);

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    for (let attempt = 0; ; attempt += 1) {
      const canRetry = attempt < 2;
      const backoffMs = 1000 * 2 ** attempt;

      await throttle();

      let response: Response;

      try {
        response = await fetchImpl(url, {
          headers: {
            Authorization: authorization,
            accept: 'application/json',
            'User-Agent': 'onchain-digest/0.1',
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        if (isTimeout(error)) throw new AppError('UPSTREAM_TIMEOUT', { cause: error });
        if (canRetry) {
          await wait(backoffMs);
          continue;
        }
        throw new AppError('UPSTREAM_ERROR', { cause: error });
      }

      if (response.ok) return response.json();

      const { status } = response;

      if (status === 429) {
        if (response.headers.get('ratelimit-org-day-remaining') === '0') {
          throw new AppError('RATE_LIMITED', {
            message: 'We’ve hit today’s data limit. Try again later.',
            detail:
              'Zerion daily quota is exhausted. Switch to USE_MOCKS=true or wait for the reset.',
            retryAfterSeconds: readSeconds(response, 'ratelimit-org-day-reset'),
          });
        }

        const retryAfterSeconds = readSeconds(response, 'ratelimit-org-second-reset') ?? 1;

        if (canRetry) {
          await wait(Math.max(retryAfterSeconds * 1000, backoffMs));
          continue;
        }
        throw new AppError('RATE_LIMITED', { retryAfterSeconds });
      }

      if (status === 503) {
        const retryAfterSeconds = readSeconds(response, 'retry-after') ?? 5;

        if (canRetry && retryAfterSeconds <= 5) {
          await wait(retryAfterSeconds * 1000);
          continue;
        }
        throw new AppError('NOT_READY', { retryAfterSeconds });
      }

      if (status >= 500) {
        if (canRetry) {
          await wait(backoffMs);
          continue;
        }
        throw new AppError('UPSTREAM_ERROR');
      }

      if (status === 400) {
        const detail = await readErrorDetail(response);

        throw new AppError(/address/i.test(detail) ? 'INVALID_ADDRESS' : 'INVALID_PARAMS');
      }

      if (status === 401 || status === 403) {
        throw new AppError('UNAUTHORIZED', {
          detail: `Zerion rejected the API key (HTTP ${status}).`,
        });
      }
      if (status === 422) throw new AppError('WALLET_TOO_LARGE');

      throw new AppError('UPSTREAM_ERROR');
    }
  };
};
