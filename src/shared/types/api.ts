export const API_ERROR_CODES = [
  'INVALID_ADDRESS',
  'INVALID_PARAMS',
  'METHOD_NOT_ALLOWED',
  'RATE_LIMITED',
  'NOT_READY',
  'WALLET_TOO_LARGE',
  'UNAUTHORIZED',
  'UPSTREAM_TIMEOUT',
  'UPSTREAM_ERROR',
  'INTERNAL',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface IApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    retryAfterSeconds?: number;
  };
}
