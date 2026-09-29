import type { ApiErrorCode, IApiErrorBody } from 'shared/types';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  INVALID_ADDRESS: 400,
  INVALID_PARAMS: 400,
  METHOD_NOT_ALLOWED: 405,
  RATE_LIMITED: 429,
  NOT_READY: 503,
  WALLET_TOO_LARGE: 422,
  UNAUTHORIZED: 502,
  UPSTREAM_TIMEOUT: 504,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
};

const MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  INVALID_ADDRESS: 'This doesn’t look like an EVM or Solana address.',
  INVALID_PARAMS: 'Some request parameters are invalid.',
  METHOD_NOT_ALLOWED: 'Only GET is supported.',
  RATE_LIMITED: 'Too many requests, try again in a few seconds.',
  NOT_READY: 'This wallet is still being indexed. Try again shortly.',
  WALLET_TOO_LARGE: 'This wallet has too much history to summarize.',
  UNAUTHORIZED: 'Wallet data is temporarily unavailable. Try again later.',
  UPSTREAM_TIMEOUT: 'The data provider took too long to respond.',
  UPSTREAM_ERROR: 'The data provider is having trouble right now.',
  INTERNAL: 'Something went wrong on our side.',
};

interface IAppErrorOptions {
  message?: string;
  detail?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly retryAfterSeconds: number | undefined;
  readonly detail: string | undefined;

  constructor(
    code: ApiErrorCode,
    { message, detail, retryAfterSeconds, cause }: IAppErrorOptions = {},
  ) {
    super(message ?? MESSAGE_BY_CODE[code], { cause });
    this.name = 'AppError';
    this.code = code;
    this.detail = detail;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get status(): number {
    return STATUS_BY_CODE[this.code];
  }

  toBody(): IApiErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.retryAfterSeconds != null && { retryAfterSeconds: this.retryAfterSeconds }),
      },
    };
  }
}

export const toAppError = (error: unknown): AppError =>
  error instanceof AppError ? error : new AppError('INTERNAL', { cause: error });
