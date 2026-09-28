import type { ApiErrorCode, IApiErrorBody } from 'shared/types';

export class ApiError extends Error {
  readonly code: ApiErrorCode | 'NETWORK';
  readonly status: number;
  readonly retryAfterSeconds: number | undefined;

  constructor(
    code: ApiErrorCode | 'NETWORK',
    message: string,
    status: number,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get isRetryable(): boolean {
    return !['INVALID_ADDRESS', 'INVALID_PARAMS', 'RATE_LIMITED', 'UNAUTHORIZED'].includes(
      this.code,
    );
  }
}

const fillTemplate = (template: string, routeParams: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = routeParams[key];

    if (value == null) throw new Error(`Missing route param "${key}" for ${template}`);

    return encodeURIComponent(value);
  });

const isErrorBody = (body: unknown): body is IApiErrorBody =>
  typeof body === 'object' && body != null && 'error' in body;

export const createEndpoint =
  <Response, Params extends Record<string, string>, RouteParams extends Record<string, string>>(
    template: string,
  ) =>
  async (routeParams: RouteParams, params: Params, signal?: AbortSignal): Promise<Response> => {
    const query = new URLSearchParams(params).toString();
    const url = `/api/${fillTemplate(template, routeParams)}${query ? `?${query}` : ''}`;
    let response: globalThis.Response;

    try {
      response = await fetch(url, { headers: { Accept: 'application/json' }, signal });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new ApiError('NETWORK', 'You seem to be offline.', 0);
    }

    const body: unknown = await response.json().catch(() => null);

    if (response.ok) return body as Response;
    if (isErrorBody(body)) {
      const { code, message, retryAfterSeconds } = body.error;

      throw new ApiError(code, message, response.status, retryAfterSeconds);
    }

    throw new ApiError('INTERNAL', 'Something went wrong on our side.', response.status);
  };
