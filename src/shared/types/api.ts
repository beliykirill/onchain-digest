export type ApiErrorCode =
  | 'INVALID_ADDRESS'
  | 'INVALID_PARAMS'
  | 'METHOD_NOT_ALLOWED'
  | 'RATE_LIMITED'
  | 'NOT_READY'
  | 'WALLET_TOO_LARGE'
  | 'UNAUTHORIZED'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL';

export interface IApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    retryAfterSeconds?: number;
  };
}
